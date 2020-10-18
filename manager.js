import Constants, { Actions, AccelerationState, TurnState, Orientation, ProfileTransceiverStatus, OtaDownloadStatus, BatteryState, ConnectionState, toAccelerationState, toTurnState, toOrientation } from '../constants'
import { encode, decode } from '@msgpack/msgpack'
import { Subject } from 'rxjs'

const decoder = new TextDecoder('utf-8')
const encoder = new TextEncoder('utf-8')
const MTU = 512
const PacketSize = MTU - 3

export default class Amp {
  name = ""
  device = null
  server = null
  deviceInfoService = null
  vehicleService = null
  profileService = null
  otaService = null

  controlCharacteristic = null
  stateCharacteristic = null
  lightsCharacteristic = null
  calibrationCharacteristic = null
  resetCharacteristic = null

  profileTransmit = null
  profileReceive = null
  profileStatus = null

  batteryCharacteristic = null
  otaControl = null
  otaTransmit = null
  otaStatus = null

  serialNumber = null
  firmwareRevision = null
  hardwareRevision = null

  _profile = null

  batteryState = {
    level: 0,
    state: BatteryState.UNKNOWN,
    present: false,
    charging: false
  }

  connection = new Subject()
  battery = new Subject()
  deviceInfo = new Subject()
  control = new Subject()
  action = new Subject()
  profileTransceive = new Subject()
  profile = new Subject()
  otaDownload = new Subject()

  profileReceiveBuffer = new Uint8Array()

  controlState = {
    autoBrake: false,
    autoTurn: false,
    autoOrientation: false
  }

  actionState = {
    motion: AccelerationState.NEUTRAL,
    turn: TurnState.CENTER,
    orientation: Orientation.UNKNOWN
  }

  _profileTransceiveInProgress = false
  _receiveSize = 0
  _receivedSize = 0

  getDeviceOptions() {
    return {
      filters: [{ services: [Constants.vehicleService] }],
      optionalServices: [
        'device_information',
        'battery_service',
        Constants.vehicleService,
        Constants.profileService,
        Constants.otaService
      ]
    }
  }

  async connectAmp(device) {
    this.device = device

    try {
      this.connection.next(ConnectionState.CONNECTING)
      this.server = await this.device.gatt.connect()
      this.connection.next(ConnectionState.DISCOVERING_SERVICES)

      this.name = device.name
      device.addEventListener('gattserverdisconnected', () => this.onDisconnected())

      // get device info
      await this.getDeviceInfo()

      // battery level
      let batteryService = await this.server.getPrimaryService('battery_service')
      this.batteryCharacteristic = await batteryService.getCharacteristic('battery_level_state')

      // battery level notifications
      this.batteryCharacteristic.addEventListener('characteristicvaluechanged', this.onBatteryStateChanged)
      this.batteryCharacteristic.startNotifications()
      this.batteryState = this.parseBatteryState(await this.batteryCharacteristic.readValue())

      // vehicle service
      let vehicleService = await this.server.getPrimaryService(Constants.vehicleService)
      this.controlCharacteristic = await vehicleService.getCharacteristic(Constants.controlCharacteristic)
      this.stateCharacteristic = await vehicleService.getCharacteristic(Constants.stateCharacteristic)
      this.lightsCharacteristic = await vehicleService.getCharacteristic(Constants.lightsCharacteristic)
      this.calibrationCharacteristic = await vehicleService.getCharacteristic(Constants.calibrationCharacteristic)
      this.resetCharacteristic = await vehicleService.getCharacteristic(Constants.resetCharacteristic)

      // vehicle service notifications
      this.controlCharacteristic.addEventListener('characteristicvaluechanged', event => this.onControlChanged(event))
      this.controlCharacteristic.startNotifications()

      this.stateCharacteristic.addEventListener('characteristicvaluechanged', event => this.onAmpStateChanged(event))
      this.stateCharacteristic.startNotifications()

      // profile service
      let profileService = await this.server.getPrimaryService(Constants.profileService)
      this.profileTransmit = await profileService.getCharacteristic(Constants.profileTransmitCharacteristic)
      this.profileReceive = await profileService.getCharacteristic(Constants.profileReceiveCharacteristic)
      this.profileStatus = await profileService.getCharacteristic(Constants.profileStatusCharacteristic)

      // profile service notifications
      this.profileReceive.addEventListener('characteristicvaluechanged', event => this.onProfileReceived(event))
      this.profileReceive.startNotifications()

      this.profileStatus.addEventListener('characteristicvaluechanged', event => this.onProfileTransceiveChanged(event))
      this.profileStatus.startNotifications()

      // ota service
      let otaService = await this.server.getPrimaryService(Constants.otaService)
      this.otaControl = await otaService.getCharacteristic(Constants.otaControlCharacteristic)
      this.otaTransmit = await otaService.getCharacteristic(Constants.otaTransmitCharacteristic)
      this.otaStatus = await otaService.getCharacteristic(Constants.otaStatusCharacteristic)

      // ota service notifications
      this.otaStatus.addEventListener('characteristicvaluechanged', event => this.onOTAStatusChanged(event))
      this.otaStatus.startNotifications()

      this._profileTransceiveInProgress = false
      this.connection.next(ConnectionState.READY)
    }
    catch (err) {
      console.error('amp connection error', err)
      this.connection.next(ConnectionState.ERROR)
    }
  }

  onDisconnected() {
    this.connection.next(ConnectionState.DISCONNECTED)
  }

  async getDeviceInfo() {
    let deviceInfo = await this.server.getPrimaryService('device_information')

    // let tempCharacteristic = await deviceInfo.getCharacteristic('serial_number_string')
    // this.serialNumber = decoder.decode(await tempCharacteristic.readValue())

    let tempCharacteristic = await deviceInfo.getCharacteristic('firmware_revision_string')
    this.firmwareRevision = decoder.decode(await tempCharacteristic.readValue())

    tempCharacteristic = await deviceInfo.getCharacteristic('hardware_revision_string')
    this.hardwareRevision = decoder.decode(await tempCharacteristic.readValue())

    this.deviceInfo.next({ serialNumber: this.serialNumber, firmwareRevision: this.firmwareRevision, hardwareRevision: this.hardwareRevision })
  }

  async updateControl(autoBrake, autoTurn, autoOrientation) {
    let data = new Uint8Array(3)
    if (autoBrake === null)
      data[0] = 0x00
    else
      data[0] = autoBrake ? 0x01 : 0x00

    if (autoTurn === null)
      data[1] = 0x00
    else
      data[1] = autoTurn ? 0x01 : 0x00
    
    if (autoOrientation === null)
      data[2] = 0x00
    else
      data[2] = autoOrientation ? 0x01 : 0x00

    await this.controlCharacteristic.writeValue(data)
  }

  async updateLights(brakes = Actions.IGNORE, headlight = Actions.IGNORE, indicators = Actions.IGNORE) {
    console.log(`update lights: ${brakes}, ${headlight}, ${indicators}`)
    let data = new Uint8Array(3)
    data[0] = brakes
    data[1] = headlight
    data[2] = indicators

    await this.lightsCharacteristic.writeValue(data)
  }

  async calibrate(calibrateAccelerometer, calibrateGyroscope, calibrateMagnetometer) {
    let data = new Uint8Array(3)
    data[0] = calibrateAccelerometer ? 0x01 : 0x00
    data[1] = calibrateGyroscope ? 0x01 : 0x00
    data[2] = calibrateMagnetometer ? 0x01 : 0x00

    await this.calibrationCharacteristic.writeValue(data)
  }

  async reset() {
    await this.resetCharacteristic.writeValue(Uint8Array.of(1))
  }

  async startOTAUpdate() {
    await this.otaControl.writeValue(OtaDownloadStatus.DOWNLOAD_START)
    this.otaDownloadUpdates.next({ status: OtaDownloadStatus.DOWNLOAD_START, progress: 0 })
  }

  async endOTAUpdate() {
    await this.otaControl.writeValue(OtaDownloadStatus.DOWNLOAD_END)
    this.otaDownloadUpdates.next({ status: OtaDownloadStatus.DOWNLOAD_END, progress: 100 })
  }

  async sendOTAUpdate(url) {
    await this.startOTAUpdate()

    let response = await fetch(url)
    if (response.ok()) {
      let data = await response.blob()
      let parts = Math.ceil(data.size / PacketSize)
      let buffer = await data.arrayBuffer()

      for (let i = 0; i < parts; i++) {
        let part = buffer.subarray(PacketSize * i, PacketSize * (i + 1))
        await this.otaTransmit.writeValue(part)
        this.otaDownloadUpdates.next({ progress: i / parts })
      }
    }

    await this.endOTAUpdate()
  }

  async profileSend(key, value, encodeValue = true) {
    if (this._profileTransceiveInProgress)
      throw new Error('profile tx / rx is already in progress')

    this._profileTransceiveInProgress = true
    this.profileTransceive.next({ progress: 0, done: false })

    // encode key and only encode value if necessary
    let keyEncoded = encoder.encode(`${key}:`)
    let valueEncoded = encodeValue ? encoder.encode(value) : value

    // packed data
    let encoded = new Uint8Array(keyEncoded.buffer.byteLength + valueEncoded.buffer.byteLength)
    encoded.set(keyEncoded, 0)
    encoded.set(valueEncoded, keyEncoded.buffer.byteLength)
    
    let header = new Uint8Array(5)
    header.set(Uint8Array.of(ProfileTransceiverStatus.TRANSMIT_START), 0)
    header.set(this.toPackedUint32(encoded.buffer.byteLength), 1)

    console.log(`sending ${encoded.buffer.byteLength} bytes`, header)
    console.log(`raw`, encoded)

    // tell the profile service we're starting to transmit with x bytes
    await this.profileStatus.writeValue(header)

    // send the data
    let parts = Math.ceil(encoded.buffer.byteLength / PacketSize)
    console.log(`parts: ${parts}`)
    for (let i = 0; i < parts; i++) {
      let part = encoded.slice(PacketSize * i, PacketSize * (i + 1))
      console.log(`sending: ${part.buffer.byteLength} bytes`, part)
      await this.profileTransmit.writeValue(part)
      this.profileTransceive.next({ progress: i / parts, done: false })
    }

    // notify that we're ending a config transmission
    this._profileTransceiveInProgress = false
    this.profileTransceive.next({ progress: 100, done: true })
  }

  toPackedUint32(num) {
    let asUint32 = Uint32Array.of(num)
    let view = new DataView(asUint32.buffer)
    return new Uint8Array(view.buffer)
  }

  async setDeviceName(name) {
    await this.profileSend('name', name)
  }

  async setEffect(action, region, effect, save = false) {
    let key = save ? "saveEffect" : "effect"
    await this.profileSend(key, `${action},${region},${effect}`)
  }

  async getProfile() {
    // request profile
    await this.profileSend('get', 'config')
  }

  async setProfile(profile) {
    let msgpackEncoded = encode(profile)
    msgpackEncoded = msgpackEncoded.slice(msgpackEncoded.byteOffset, msgpackEncoded.byteLength)
    await this.profileSend('raw', msgpackEncoded, false)
  }

  onBatteryStateChanged(event) {
    if (event.data) {
      const data = event.data.value
      this.batteryState = this.parseBatteryState(data)
      this.battery.next(this.batteryState)
    }
  }

  parseBatteryState(data) {
    let batteryState = Object.assign({}, this.batteryState)
    batteryState.level = data.getUint8(0)

    let state = data.getUint8(1)
    let binary = (state >>> 0).toString(2)
    
    // state of charge
    let binaryStateString = binary.substring(0, 2)
    if (binaryStateString === '10')
      batteryState.state = BatteryState.NORMAL
    else if (binaryStateString === '11')
      batteryState.state = BatteryState.CRITICAL
    else
      batteryState.state = BatteryState.UNKNOWN

    // discharging / charging
    let charging = binary.substring(2, 4)
    if (charging === '11')
      batteryState.charging = true
    else if (charging === '10')
      batteryState.charging = false

    // battery present
    let present = binary.substring(6, 8)
    if (present === '11')
      batteryState.present = true
    else if (present === '10')
      batteryState.present = false

    return batteryState
  }

  onControlChanged(event) {
    const data = event.target.value
    let temp = null
    
    if (data.byteLength >= 1) {
      temp = data.getUint8(0)
      this.controlState.autoBrake = temp === 0x00 ? this.controlState.autoBrake : temp === 0x01 ? false : true
    }

    if (data.byteLength >= 2) {
      temp = data.getUint8(1)
      this.controlState.autoTurn = temp === 0x00 ? this.controlState.autoTurn : temp === 0x01 ? false : true
    }

    if (data.byteLength >= 3) {
      temp = data.getUint8(2)
      this.controlState.autoOrientation = temp === 0x00 ? this.controlState.autoOrientation : temp === 0x01 ? false : true
    }

    this.control.next(this.controlState)
  }

  onAmpStateChanged(event) {
    const data = event.target.value
    let temp = null

    temp = data.getUint8(0)
    this.actionState.motion = toAccelerationState(temp)

    temp = data.getUint8(1)
    this.actionState.turn = toTurnState(temp)

    temp = data.getUint8(2)
    this.actionState.orientation = toOrientation(temp)

    this.action.next(this.actionState)
  }

  onProfileReceived(event) {
    const data = event.target.value
    this.profileReceiveBuffer.set(new Uint8Array(data.buffer), this._receivedSize)
    this._receivedSize += data.buffer.byteLength

    console.log(`received profile data: ${this._receivedSize}/${this._receiveSize}`)

    if (this._receivedSize === this._receiveSize) {
      this.parseReceivedData(this.profileReceiveBuffer)
      this._profileTransceiveInProgress = false
    }
  }

  onProfileTransceiveChanged(event) {
    const data = event.target.value
    let status = data.getUint8(0)

    switch (status) {
      case ProfileTransceiverStatus.TRANSMIT_START:
        break;
      case ProfileTransceiverStatus.RECEIVE_START:
        // TODO: ensure we don't get a start of packet while a transceive is in progress      
        this._receiveSize = data.getUint32(1, true)
        this._receivedSize = 0;
        this.profileReceiveBuffer = new Uint8Array(this._receiveSize)

        this._profileTransceiveInProgress = true
        this.profileTransceive.next({ status: status, progress: 0, done: false })
        
        console.log(`start receive profile - expecting ${this._receiveSize} bytes`)
        
        break;
      default:
        console.error('unknown transceiver status', status)
    }
  }

  parseReceivedData(buffer) {
    console.log('from amp', buffer)
    // find colon
    let colonIndex = buffer.indexOf(58)
    if (colonIndex != -1) {
      let keyBuffer = buffer.slice(0, colonIndex)
      let valueBuffer = buffer.slice(colonIndex + 1, buffer.buffer.byteLength)
      let key = decoder.decode(keyBuffer)
      console.log('raw', valueBuffer)

      if (key === 'raw') {
        this._profile = decode(valueBuffer)
        this.profile.next(this._profile)
      }
    }
  }

  onOTAStatusChanged(event) {
    const data = event.target.value
    let status = data.getUint8(0)

    this.otaDownloadUpdates.next({ status: status })
  }
}