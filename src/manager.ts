import { Bluetooth, Action, AccelerationState, TurnState, Orientation, ProfileTransceiverStatus, OtaDownloadStatus, BatteryState, ConnectionState, Profile, ActionsText } from './models'
import { encode, decode } from '@msgpack/msgpack'
import { Subject } from 'rxjs'
import * as _ from 'lodash'

const decoder = new TextDecoder('utf-8')
const encoder = new TextEncoder()

export interface ConnectionStatus {
  state: ConnectionState
  data: null | Error
}

export interface ControlState {
  autoMotion: boolean
  autoTurn: boolean
  autoOrientation: boolean
}

export interface MotionState {
  motion: AccelerationState
  turn: TurnState
  orientation: Orientation
}

export interface ActionState {
  motion: Action
  turn: Action
  headlight: Action
  orientation: Action
}

export interface AmpBatteryState {
  level: number
  state: BatteryState
  present: boolean
  charging: boolean
}

export interface ProfileTransceiverState {
  progress: number
  status: ProfileTransceiverStatus | null
  done: boolean
}

export interface OTAUpdateState {
  status?: OtaDownloadStatus
  progress?: number
}

export default class Amp {
  name: String = ""
  device: BluetoothDevice | null = null
  server: BluetoothRemoteGATTServer | null = null
  deviceInfoService: BluetoothRemoteGATTService | null = null
  vehicleService: BluetoothRemoteGATTService | null = null
  profileService: BluetoothRemoteGATTService | null = null
  otaService: BluetoothRemoteGATTService | null = null

  controlCharacteristic: BluetoothRemoteGATTCharacteristic | null = null
  stateCharacteristic: BluetoothRemoteGATTCharacteristic | null = null
  lightsCharacteristic: BluetoothRemoteGATTCharacteristic | null = null
  calibrationCharacteristic: BluetoothRemoteGATTCharacteristic | null = null
  resetCharacteristic: BluetoothRemoteGATTCharacteristic | null = null

  profileTransmit: BluetoothRemoteGATTCharacteristic | null = null
  profileReceive: BluetoothRemoteGATTCharacteristic | null = null
  profileStatus: BluetoothRemoteGATTCharacteristic | null = null

  batteryCharacteristic: BluetoothRemoteGATTCharacteristic | null = null
  otaControl: BluetoothRemoteGATTCharacteristic | null = null
  otaTransmit: BluetoothRemoteGATTCharacteristic | null = null
  otaStatus: BluetoothRemoteGATTCharacteristic | null = null

  serialNumber: string | null = null
  firmwareRevision: string | null = null
  hardwareRevision: string | null = null

  MTU: number = 512
  PacketSize: number = 509

  connection = new Subject<ConnectionStatus>()
  battery = new Subject<AmpBatteryState>()
  deviceInfo = new Subject()
  control = new Subject()
  motion = new Subject()
  actions = new Subject()
  profileTransceive = new Subject()
  profile = new Subject()
  otaDownload = new Subject()
  otaDownloadUpdates = new Subject<OTAUpdateState>()

  profileReceiveBuffer = new Uint8Array()

  batteryState: AmpBatteryState = {
    level: 0,
    state: BatteryState.unknown,
    present: false,
    charging: false
  }

  controlState: ControlState = {
    autoMotion: false,
    autoTurn: false,
    autoOrientation: false
  }

  motionState: MotionState = {
    motion: AccelerationState.neutral,
    turn: TurnState.center,
    orientation: Orientation.unknown
  }

  actionState: ActionState = {
    motion: Action.motion_neutral,
    turn: Action.turn_center,
    headlight: Action.headlight_normal,
    orientation: Action.orientation_unknown
  }

  profileTransceiveState: ProfileTransceiverState = {
    status: null,
    progress: 0,
    done: false
  }

  _profileTransceiveInProgress = false
  _receiveSize = 0
  _receivedSize = 0
  _otaDownloadStatus: OtaDownloadStatus | null = null

  _profile: Profile | null = null

  constructor(MTU = 512) {
    this.MTU = MTU
    this.PacketSize = MTU - 3
  }

  getDeviceOptions() {
    return {
      filters: [{ services: [Bluetooth.vehicleService] }],
      optionalServices: [
        'device_information',
        'battery_service',
        Bluetooth.vehicleService,
        Bluetooth.profileService,
        Bluetooth.otaService
      ]
    }
  }

  async connectAmp(device: BluetoothDevice) {
    this.device = device

    try {
      this.connection.next({ state: ConnectionState.connecting, data: null })
      this.server = await this.device.gatt!!.connect()
      this.connection.next({ state: ConnectionState.discovering_services, data: null })

      this.name = device.name!!
      device.addEventListener('gattserverdisconnected', () => this.onDisconnected())

      // get device info
      await this.getDeviceInfo()

      // battery level
      try {
        let batteryService = await this.server.getPrimaryService('battery_service')
        this.batteryCharacteristic = await batteryService.getCharacteristic('battery_level_state')

        // battery level notifications
        this.batteryState = this.parseBattery(await this.batteryCharacteristic.readValue())
        this.batteryCharacteristic.addEventListener('characteristicvaluechanged', this.onBatteryStateChanged)
        this.batteryCharacteristic.startNotifications()
      } catch (err) {
        console.warn(err)
      }

      // vehicle service
      let vehicleService = await this.server.getPrimaryService(Bluetooth.vehicleService)
      this.controlCharacteristic = await vehicleService.getCharacteristic(Bluetooth.controlCharacteristic)
      this.stateCharacteristic = await vehicleService.getCharacteristic(Bluetooth.stateCharacteristic)
      this.lightsCharacteristic = await vehicleService.getCharacteristic(Bluetooth.lightsCharacteristic)
      this.calibrationCharacteristic = await vehicleService.getCharacteristic(Bluetooth.calibrationCharacteristic)
      this.resetCharacteristic = await vehicleService.getCharacteristic(Bluetooth.resetCharacteristic)

      // get initial amp state
      this.controlState = this.parseControl(await this.controlCharacteristic.readValue())
      this.motionState = this.parseMotion(await this.stateCharacteristic.readValue())
      this.actionState = this.parseActions(await this.lightsCharacteristic.readValue())

      // vehicle service notifications
      this.controlCharacteristic.addEventListener('characteristicvaluechanged', event => this.onControlChanged(event))
      this.controlCharacteristic.startNotifications()

      this.stateCharacteristic.addEventListener('characteristicvaluechanged', event => this.onMotionChanged(event))
      this.stateCharacteristic.startNotifications()

      this.lightsCharacteristic.addEventListener('characteristicvaluechanged', event => this.onActionsChanged(event))
      this.lightsCharacteristic.startNotifications()

      // profile service
      let profileService = await this.server.getPrimaryService(Bluetooth.profileService)
      this.profileTransmit = await profileService.getCharacteristic(Bluetooth.profileTransmitCharacteristic)
      this.profileReceive = await profileService.getCharacteristic(Bluetooth.profileReceiveCharacteristic)
      this.profileStatus = await profileService.getCharacteristic(Bluetooth.profileStatusCharacteristic)

      // profile service notifications
      this.profileReceive.addEventListener('characteristicvaluechanged', event => this.onProfileReceived(event))
      this.profileReceive.startNotifications()

      this.profileStatus.addEventListener('characteristicvaluechanged', event => this.onProfileTransceiveChanged(event))
      this.profileStatus.startNotifications()

      // ota service
      let otaService = await this.server.getPrimaryService(Bluetooth.otaService)
      this.otaControl = await otaService.getCharacteristic(Bluetooth.otaControlCharacteristic)
      this.otaTransmit = await otaService.getCharacteristic(Bluetooth.otaTransmitCharacteristic)
      this.otaStatus = await otaService.getCharacteristic(Bluetooth.otaStatusCharacteristic)

      // ota service notifications
      this.otaStatus.addEventListener('characteristicvaluechanged', event => this.onOTAStatusChanged(event))
      this.otaStatus.startNotifications()

      this._profileTransceiveInProgress = false
      this.connection.next({ state: ConnectionState.ready, data: null })
    }
    catch (err) {
      console.error('amp connection error', err)
      this.connection.next({ state: ConnectionState.error, data: err as Error })
    }
  }

  onDisconnected() {
    this.connection.next({ state: ConnectionState.disconnected, data: null })
  }

  async getDeviceInfo() {
    let deviceInfo = await this.server?.getPrimaryService('device_information')

    // disabled because of web bluetooth privacy restrictions
    // let tempCharacteristic = await deviceInfo.getCharacteristic('serial_number_string')
    // this.serialNumber = decoder.decode(await tempCharacteristic.readValue())

    let tempCharacteristic = await deviceInfo?.getCharacteristic('firmware_revision_string')
    this.firmwareRevision = decoder.decode(await tempCharacteristic?.readValue())

    tempCharacteristic = await deviceInfo?.getCharacteristic('hardware_revision_string')
    this.hardwareRevision = decoder.decode(await tempCharacteristic?.readValue())

    this.deviceInfo.next({ serialNumber: this.serialNumber, firmwareRevision: this.firmwareRevision, hardwareRevision: this.hardwareRevision })
  }

  async updateControl({autoMotion, autoTurn, autoOrientation}: ControlState) {
    let data = new Uint8Array(3)
    if (autoMotion === null)
      data[0] = 0x00
    else
      data[0] = autoMotion ? 0x01 : 0x02

    if (autoTurn === null)
      data[1] = 0x00
    else
      data[1] = autoTurn ? 0x01 : 0x02
    
    if (autoOrientation === null)
      data[2] = 0x00
    else
      data[2] = autoOrientation ? 0x01 : 0x02

    await this.controlCharacteristic?.writeValue(data)
  }

  async updateLights(motion = Action.ignore, headlight = Action.ignore, indicators = Action.ignore, orientation = Action.ignore) {
    console.log(`update lights: ${motion}, ${headlight}, ${indicators}, ${orientation}`)
    let data = new Uint8Array(3)
    data[0] = motion
    data[1] = headlight
    data[2] = indicators
    data[3] = orientation

    await this.lightsCharacteristic?.writeValue(data)
  }

  async calibrate(calibrateAccelerometer: boolean, calibrateGyroscope: boolean, calibrateMagnetometer: boolean) {
    let data = new Uint8Array(3)
    data[0] = calibrateAccelerometer ? 0x01 : 0x00
    data[1] = calibrateGyroscope ? 0x01 : 0x00
    data[2] = calibrateMagnetometer ? 0x01 : 0x00

    await this.calibrationCharacteristic?.writeValue(data)
  }

  async reset() {
    await this.resetCharacteristic?.writeValue(Uint8Array.of(1))
  }

  async startOTAUpdate() {
    const data = new Uint8Array(1)
    data[0] = OtaDownloadStatus.download_start
    await this.otaControl?.writeValue(data)
    this.otaDownloadUpdates.next({ status: OtaDownloadStatus.download_start, progress: 0 })
  }

  async endOTAUpdate() {
    const data = new Uint8Array(1)
    data[0] = OtaDownloadStatus.download_end
    await this.otaControl?.writeValue(data)
    this.otaDownloadUpdates.next({ status: OtaDownloadStatus.download_end, progress: 100 })
  }

  async downloadOTAUpdate(url: string) {
    const response = await fetch(url)
    if (response.ok) {
      const data = await response.blob()
      const buffer = await data.arrayBuffer()

      this.sendOTAUpdate(buffer)
    }
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendOTAUpdate(data: ArrayBuffer) {
    await this.startOTAUpdate()
    await this.sleep(1000)
    const parts = Math.ceil(data.byteLength / this.PacketSize)

    if (this._otaDownloadStatus === OtaDownloadStatus.download_start_error)
      return

    for (let i = 0; i < parts; i++) {
      if (this._otaDownloadStatus === OtaDownloadStatus.download_write_error || this._otaDownloadStatus === OtaDownloadStatus.download_end_error)
        return
      let part = data.slice(this.PacketSize * i, this.PacketSize * (i + 1))
      await this.otaTransmit?.writeValue(part)
      this.otaDownloadUpdates.next({ progress: i / parts })
    }

    await this.endOTAUpdate()
  }

  async profileSend(key: string, value: string | Uint8Array) {
    if (this._profileTransceiveInProgress)
      throw new Error('profile tx / rx is already in progress')

    this._profileTransceiveInProgress = true
    this.profileTransceiveState = { status: ProfileTransceiverStatus.transmit_start, progress: 0, done: false }
    this.profileTransceive.next(this.profileTransceiveState)

    // encode key and only encode value if necessary
    let keyEncoded = encoder.encode(`${key}:`)
    let valueEncoded = typeof value === 'string' ? encoder.encode(value) : value

    // packed data
    let encoded = new Uint8Array(keyEncoded.buffer.byteLength + valueEncoded.buffer.byteLength)
    encoded.set(keyEncoded, 0)
    encoded.set(valueEncoded, keyEncoded.buffer.byteLength)
    
    let header = new Uint8Array(5)
    header.set(Uint8Array.of(ProfileTransceiverStatus.transmit_start), 0)
    header.set(this.toPackedUint32(encoded.buffer.byteLength), 1)

    // tell the profile service we're starting to transmit with x bytes
    await this.profileStatus?.writeValue(header)

    // send the data
    let parts = Math.ceil(encoded.buffer.byteLength / this.PacketSize)
    for (let i = 0; i < parts; i++) {
      let part = encoded.slice(this.PacketSize * i, this.PacketSize * (i + 1))
      await this.profileTransmit?.writeValue(part)
      this.profileTransceiveState = Object.assign(this.profileTransceiveState, { progress: i / parts, done: false })
      this.profileTransceive.next(this.profileTransceiveState)
    }

    // notify that we're ending a config transmission
    this._profileTransceiveInProgress = false
    this.profileTransceiveState = Object.assign(this.profileTransceiveState, { progress: 100, done: true })
    this.profileTransceive.next(this.profileTransceiveState)
  }

  toPackedUint32(num: number) {
    let asUint32 = Uint32Array.of(num)
    let view = new DataView(asUint32.buffer)
    return new Uint8Array(view.buffer)
  }

  async setDeviceName(name: string) {
    await this.profileSend('name', name)
    this.name = name
  }

  async setEffect(action: [keyof ActionsText], region: string, effect: string, save = false) {
    let key = save ? "saveEffect" : "effect"
    await this.profileSend(key, `${action},${region},${effect}`)
  }

  async getProfile() {
    // request profile
    await this.profileSend('get', 'config')
  }

  async setProfile(profile: Profile) {
    let msgpackEncoded = encode(profile)
    msgpackEncoded = msgpackEncoded.slice(msgpackEncoded.byteOffset, msgpackEncoded.byteLength)
    await this.profileSend('raw', msgpackEncoded)
  }

  onBatteryStateChanged(event: any) {
    if (event.data) {
      const data = event.data.value
      let newBattery = this.parseBattery(data)

      // only push a new battery state if things have changed
      if (!_.isEqual(this.batteryState, newBattery)) {
        this.batteryState = newBattery
        this.battery.next(this.batteryState)
      }
    }
  }

  parseBattery(data: DataView) {
    let batteryState = Object.assign({}, this.batteryState)
    batteryState.level = data.getUint8(0)

    let state = data.getUint8(1)
    let binary = (state >>> 0).toString(2)
    
    // state of charge
    let binaryStateString = binary.substring(0, 2)
    if (binaryStateString === '10')
      batteryState.state = BatteryState.normal
    else if (binaryStateString === '11')
      batteryState.state = BatteryState.critical
    else
      batteryState.state = BatteryState.unknown

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

  parseControl(data: DataView) {
    let temp = null

    let control = Object.assign({}, this.controlState)
    
    if (data.byteLength >= 1) {
      temp = data.getUint8(0)
      control.autoMotion = temp === 0x00 ? this.controlState.autoMotion : temp === 0x01 ? false : true
    }

    if (data.byteLength >= 2) {
      temp = data.getUint8(1)
      control.autoTurn = temp === 0x00 ? this.controlState.autoTurn : temp === 0x01 ? false : true
    }

    if (data.byteLength >= 3) {
      temp = data.getUint8(2)
      control.autoOrientation = temp === 0x00 ? this.controlState.autoOrientation : temp === 0x01 ? false : true
    }

    return control
  }

  onControlChanged(event: any) {
    const data = event.target?.value
    let newControl = this.parseControl(data)

    // only push a new control state if things have changed
    if (!_.isEqual(this.controlState, newControl)) {
      this.controlState = newControl
      this.control.next(this.controlState)
    }
  }

  parseMotion(data: DataView) {
    let temp = null
    let motion = Object.assign({}, this.motionState)

    temp = data.getUint8(0)
    motion.motion = temp as AccelerationState

    temp = data.getUint8(1)
    motion.turn = temp as TurnState

    temp = data.getUint8(2)
    motion.orientation = temp as Orientation

    return motion
  }

  onMotionChanged(event: any) {
    const data = event.target.value
    let newMotion = this.parseMotion(data)

    // only push a new motion state if things have changed
    if (!_.isEqual(this.motionState, newMotion)) {
      this.motionState = newMotion
      this.motion.next(this.motionState)
    }
  }

  parseActions(data: DataView) {
    let temp = null
    let actions = Object.assign({}, this.actionState)

    temp = data.getUint8(0)
    const motionAction = temp as Action
    actions.motion = motionAction == Action.ignore ? this.actionState.motion : motionAction

    temp = data.getUint8(1)
    const headlightAction = temp as Action
    actions.headlight = headlightAction == Action.ignore ? this.actionState.headlight : headlightAction

    temp = data.getUint8(2)
    const turnAction = temp as Action
    actions.turn = turnAction == Action.ignore ? this.actionState.turn : turnAction

    temp = data.getUint8(3)
    const orientationAction = temp as Action
    actions.orientation = orientationAction == Action.ignore ? this.actionState.orientation : orientationAction

    return actions
  }

  onActionsChanged(event: any) {
    const data = event.target?.value
    let newActions = this.parseActions(data)

    // only push a new action state if things have changed
    if (!_.isEqual(this.actionState, newActions)) {
      this.actionState = newActions
      this.actions.next(this.actionState)
    }
  }

  onProfileReceived(event: any) {
    const data = event.target.value
    this.profileReceiveBuffer.set(new Uint8Array(data.buffer), this._receivedSize)
    this._receivedSize += data.buffer.byteLength

    this.profileTransceiveState = Object.assign(this.profileTransceiveState, { progress: this._receivedSize / this._receiveSize, done: this._receiveSize == this._receivedSize })
    this.profileTransceive.next(this.profileTransceiveState)

    if (this.profileTransceiveState.done) {
      this.parseReceivedData(this.profileReceiveBuffer)
      this._profileTransceiveInProgress = false
    }
  }

  onProfileTransceiveChanged(event: any) {
    const data = event.target.value
    let status = data.getUint8(0)

    switch (status) {
      case ProfileTransceiverStatus.transmit_start:
        break;
      case ProfileTransceiverStatus.receive_start:
        // TODO: ensure we don't get a start of packet while a transceive is in progress      
        this._receiveSize = data.getUint32(1, true)
        this._receivedSize = 0;
        this.profileReceiveBuffer = new Uint8Array(this._receiveSize)

        this._profileTransceiveInProgress = true
        this.profileTransceive.next({ status: status, progress: 0, done: false })
        
        break;
      default:
        console.error('unknown transceiver status', status)
    }
  }

  parseReceivedData(buffer: Uint8Array) {
    // find colon
    let colonIndex = buffer.indexOf(58)
    if (colonIndex != -1) {
      let keyBuffer = buffer.slice(0, colonIndex)
      let valueBuffer = buffer.slice(colonIndex + 1, buffer.buffer.byteLength)
      let key = decoder.decode(keyBuffer)

      if (key === 'raw') {
        this._profile = decode(valueBuffer) as Profile
        this.profile.next(this._profile)
      }
    }
  }

  onOTAStatusChanged(event: any) {
    const data = event.target.value
    this._otaDownloadStatus = data.getUint8(0)

    this.otaDownloadUpdates.next({ status: this._otaDownloadStatus!! })
  }
}