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
  MOTION_NEUTRAL: 3,
  MOTION_BRAKES: 4,
  MOTION_ACCELERATION: 5,
  HEADLIGHT_NORMAL: 6,
  HEADLIGHT_BRIGHT: 7,
  TURN_CENTER: 8,
  TURN_LEFT: 9,
  TURN_RIGHT: 10,
  TURN_HAZARD: 11,
  ORIENTATION_UNKNOWN: 12,
  ORIENTATION_TOP: 13,
  ORIENTATION_BOTTOM: 14,
  ORIENTATION_LEFT: 15,
  ORIENTATION_RIGHT: 16,
  ORIENTATION_FRONT: 17,
  ORIENTATION_BACK: 18
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

const toAction = value => {
  switch (value) {
    case 0:
      return Actions.IGNORE
    case 1:
      return Actions.OFF
    case 2:
      return Actions.RESET
    case 3:
      return Actions.MOTION_NEUTRAL
    case 4:
      return Actions.MOTION_BRAKES
    case 5:
      return Actions.MOTION_ACCELERATION
    case 6:
      return Actions.HEADLIGHT_NORMAL
    case 7:
      return Actions.HEADLIGHT_BRIGHT
    case 8:
      return Actions.TURN_CENTER
    case 9:
      return Actions.TURN_LEFT
    case 10:
      return Actions.TURN_RIGHT
    case 11:
      return Actions.TURN_HAZARD
    case 12:
      return Actions.ORIENTATION_UNKNOWN
    case 13:
      return Actions.ORIENTATION_TOP
    case 14:
      return Actions.ORIENTATION_BOTTOM
    case 15:
      return Actions.ORIENTATION_LEFT
    case 16:
      return Actions.ORIENTATION_RIGHT
    case 17:
      return Actions.ORIENTATION_FRONT
    case 18:
      return Actions.ORIENTATION_BACK
    default:
      return Actions.IGNORE
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

const Bluetooth = {
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
  Bluetooth,
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
  toAction
}