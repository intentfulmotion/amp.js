// vehicle service
const vehicleService =                '561d73e5-dff2-4740-bfe8-89e48efeef8f'
const controlCharacteristic =         '561d73e5-dff3-4740-bfe8-89e48efeef8f'
const stateCharacteristic =           '561d73e5-dff4-4740-bfe8-89e48efeef8f'
const lightsCharacteristic =          '561d73e5-dff5-4740-bfe8-89e48efeef8f'
const calibrationCharacteristic =     '561d73e5-dff6-4740-bfe8-89e48efeef8f'
const resetCharacteristic =           '561d73e5-dff7-4740-bfe8-89e48efeef8f'

// profile service
const profileService =                '561d73e6-dff2-4740-bfe8-89e48efeef8f'
const profileTransmitCharacteristic = '561d73e6-dff3-4740-bfe8-89e48efeef8f'
const profileReceiveCharacteristic =  '561d73e6-dff4-4740-bfe8-89e48efeef8f'
const profileStatusCharacteristic =   '561d73e6-dff5-4740-bfe8-89e48efeef8f'

// ota service
const otaService =                    '561d73e7-dff2-4740-bfe8-89e48efeef8f'
const otaControlCharacteristic =      '561d73e7-dff3-4740-bfe8-89e48efeef8f'
const otaTransmitCharacteristic =     '561d73e7-dff4-4740-bfe8-89e48efeef8f'
const otaStatusCharacteristic =       '561d73e7-dff5-4740-bfe8-89e48efeef8f'

const Actions = {
  IGNORE: 0,
  OFF: 1,
  RESET: 2,
  BRAKE_NORMAL: 3,
  BRAKE_ACTIVE: 4,
  HEADLIGHT_NORMAL: 5,
  HEADLIGHT_BRIGHT: 6,
  TURN_CENTER: 7,
  TURN_LEFT: 8,
  TURN_RIGHT: 9,
  TURN_HAZARD: 10 
}

const ProfileTransceiverStatus = {
  TRANSMIT_START: 1,
  RECEIVE_START: 2
}

const OtaDownloadStatus = {
  DOWNLOAD_START: 1,
  DOWNLOAD_END: 2,
  DOWNLOAD_WRITE: 3,
  DOWNLOAD_START_ERROR: 4,
  DOWNLOAD_END_ERROR: 5,
  DOWNLOAD_WRITE_ERROR: 6
}

const AccelerationState = {
  NEUTRAL: 0,
  BRAKING: 1,
  ACCELERATING: 2
}

const TurnState = {
  CENTER: 0,
  LEFT: 1,
  RIGHT: 2,
  HAZARD: 3
}

const Orientation = {
  UNKNOWN: 0,
  TOP_UP: 1,
  BOTTOM_UP: 2,
  LEFT_UP: 3,
  RIGHT_UP: 4,
  FRONT_UP: 5,
  BACK_UP: 6
}

const BatteryState = {
  UNKNOWN: 0,
  NORMAL: 2,
  CRITICAL: 3
}

const ConnectionState = {
  DISCONNECTED: 0,
  CONNECTING: 1,
  DISCOVERING_SERVICES: 2,
  READY: 3,
  ERROR: 4
}

const toAccelerationState = value => {
  switch (value) {
    case 0: 
      return AccelerationState.NEUTRAL
    case 1:
      return AccelerationState.BRAKING
    case 2:
      return AccelerationState.ACCELERATING
    default:
      return AccelerationState.NEUTRAL
  }
}

const toTurnState = value => {
  switch (value) {
    case 0:
      return TurnState.CENTER
    case 1:
      return TurnState.LEFT
    case 2:
      return TurnState.RIGHT
    case 3:
      return TurnState.HAZARD
    default:
      return TurnState.CENTER
  }
}

const toOrientation = value => {
  switch (value) {
    case 0:
      return Orientation.UNKNOWN
    case 1:
      return Orientation.TOP_UP
    case 2:
      return Orientation.BOTTOM_UP
    case 3:
      return Orientation.LEFT_UP
    case 4:
      return Orientation.RIGHT_UP
    case 5:
      return Orientation.FRONT_UP
    case 6:
      return Orientation.BACK_UP
    default:
      return Orientation.UNKNOWN
  }
}

const toBatteryState = value => {
  switch (value) {
    case 0:
      return BatteryState.UNKNOWN
    case 2:
      return BatteryState.NORMAL
    case 3:
      return BatteryState.CRITICAL
    default:
      return BatteryState.UNKNOWN 
  }
}

export default {
  vehicleService,
  controlCharacteristic,
  stateCharacteristic,
  lightsCharacteristic,
  calibrationCharacteristic,
  resetCharacteristic,

  profileService,
  profileTransmitCharacteristic,
  profileReceiveCharacteristic,
  profileStatusCharacteristic,

  otaService,
  otaControlCharacteristic,
  otaTransmitCharacteristic,
  otaStatusCharacteristic,
}

export {
  Actions,
  AccelerationState,
  TurnState,
  Orientation,
  ProfileTransceiverStatus,
  OtaDownloadStatus,
  BatteryState,
  ConnectionState,

  toAccelerationState,
  toTurnState,
  toOrientation,
}