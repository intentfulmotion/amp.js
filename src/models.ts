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

export const Action = {
  ignore: 0,
  off: 1,
  reset: 2,
  motion_neutral: 3,
  motion_brakes: 4,
  motion_acceleration: 5,
  headlight_normal: 6,
  headlight_bright: 7,
  turn_center: 8,
  turn_left: 9,
  turn_right: 10,
  turn_hazard: 11,
  orientation_unknown: 12,
  orientation_top: 13,
  orientation_bottom: 14,
  orientation_left: 15,
  orientation_right: 16,
  orientation_front: 17,
  orientation_back: 18
}

export type Action = typeof Action[keyof typeof Action]

export const ProfileTransceiverStatus = {
  transmit_start: 1,
  receive_start: 2
}

export type ProfileTransceiverStatus = typeof ProfileTransceiverStatus[keyof typeof ProfileTransceiverStatus]

export const OtaDownloadStatus = {
  download_start: 1,
  download_end: 2,
  download_write: 3,
  download_start_error: 4,
  download_end_error: 5,
  download_write_error: 6
}

export type OtaDownloadStatus = typeof OtaDownloadStatus[keyof typeof OtaDownloadStatus]

export const AccelerationState = {
  neutral: 0,
  braking: 1,
  accelerating: 2
}

export type AccelerationState = typeof AccelerationState[keyof typeof AccelerationState]

export const TurnState = {
  center: 0,
  left: 1,
  right: 2,
  hazard: 3
}

export type TurnState = typeof TurnState[keyof typeof TurnState]

export const Orientation = {
  unknown: 0,
  top_up: 1,
  bottom_up: 2,
  left_up: 3,
  right_up: 4,
  front_up: 5,
  back_up: 6
}

export type Orientation = typeof Orientation[keyof typeof Orientation]

export const BatteryState = {
  unknown: 0,
  normal: 2,
  critical: 3
}

export type BatteryState = typeof BatteryState[keyof typeof BatteryState]

export const ConnectionState = {
  disconnected: 0,
  connecting: 1,
  discovering_services: 2,
  ready: 3,
  error: 4
}

export type ConnectionState = typeof ConnectionState[keyof typeof ConnectionState]

export const toAccelerationState = (value: number) => {
  switch (value) {
    case 0: 
      return AccelerationState.neutral
    case 1:
      return AccelerationState.braking
    case 2:
      return AccelerationState.accelerating
    default:
      return AccelerationState.neutral
  }
}

export const toTurnState = (value: number) => {
  switch (value) {
    case 0:
      return TurnState.center
    case 1:
      return TurnState.left
    case 2:
      return TurnState.right
    case 3:
      return TurnState.hazard
    default:
      return TurnState.center
  }
}

export const toOrientation = (value: number) => {
  switch (value) {
    case 0:
      return Orientation.unknown
    case 1:
      return Orientation.top_up
    case 2:
      return Orientation.bottom_up
    case 3:
      return Orientation.left_up
    case 4:
      return Orientation.right_up
    case 5:
      return Orientation.front_up
    case 6:
      return Orientation.back_up
    default:
      return Orientation.unknown
  }
}

export const toAction = (value: number) => {
  switch (value) {
    case 0:
      return Action.ignore
    case 1:
      return Action.off
    case 2:
      return Action.reset
    case 3:
      return Action.motion_neutral
    case 4:
      return Action.motion_brakes
    case 5:
      return Action.motion_acceleration
    case 6:
      return Action.headlight_normal
    case 7:
      return Action.headlight_bright
    case 8:
      return Action.turn_center
    case 9:
      return Action.turn_left
    case 10:
      return Action.turn_right
    case 11:
      return Action.turn_hazard
    case 12:
      return Action.orientation_unknown
    case 13:
      return Action.orientation_top
    case 14:
      return Action.orientation_bottom
    case 15:
      return Action.orientation_left
    case 16:
      return Action.orientation_right
    case 17:
      return Action.orientation_front
    case 18:
      return Action.orientation_back
    default:
      return Action.ignore
  }
}

export const toBatteryState = (value: number) => {
  switch (value) {
    case 0:
      return BatteryState.unknown
    case 2:
      return BatteryState.normal
    case 3:
      return BatteryState.critical
    default:
      return BatteryState.unknown
  }
}

export type ActionsText = [
  'motion-off',
  'motion-neutral',
  'motion-brakes',
  'headlight-off',
  'headlight-normal',
  'headlight-bright',
  'turn-center',
  'turn-left',
  'turn-right',
  'turn-hazard',
  'reactive'
]

export type LightEffect = {
  region: string
  effect: string
}

export type ActionProfile = Record<keyof ActionsText, LightEffect>

export type MotionProfile = {
  autoOrientation?: boolean
  autoMotion?: boolean
  autoTurn?: boolean
  brakeThreshold?: number
  accelerationThreshold?: number
  orientationAxis?: Orientation
  orientationUpMin?: number
  orientationUpMax?: number
}

export type ChannelProfile = {
  channel: number
  leds: number
  type: number
}

export type RegionProfile = {
  channel: number
  start: number
  end: number
}

export type LightProfile = {
  channels: ChannelProfile[]
  regions: { [k: string]: RegionProfile[] }
}

export type Profile = {
  motion?: MotionProfile
  actions?: ActionProfile
  lights?: LightProfile
}

export const Bluetooth = {
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