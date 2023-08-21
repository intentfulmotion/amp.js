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

export enum Action {
  ignore = 0,
  off = 1,
  reset = 2,
  motion_neutral = 3,
  motion_brakes = 4,
  motion_acceleration = 5,
  headlight_normal = 6,
  headlight_bright = 7,
  turn_center = 8,
  turn_left = 9,
  turn_right = 10,
  turn_hazard = 11,
  orientation_unknown = 12,
  orientation_top = 13,
  orientation_bottom = 14,
  orientation_left = 15,
  orientation_right = 16,
  orientation_front = 17,
  orientation_back = 18
}

export enum ProfileTransceiverStatus {
  transmit_start = 1,
  receive_start = 2
}

export enum OtaDownloadStatus {
  start = 0,
  end = 1,
  ready = 2,
  start_error = 3,
  end_error = 4,
  write_error = 5
}

export enum AccelerationState {
  neutral = 0,
  braking = 1,
  accelerating = 2
}

export enum TurnState {
  center = 0,
  left = 1,
  right = 2,
  hazard = 3
}

export enum AccelerationAxis {
  x_positive = 0,
  x_negative = 1,
  y_positive = 2,
  y_negative = 3,
  z_positive = 4,
  z_negative = 5
}

export enum AttitudeAxis {
  roll = 0,
  roll_negative = 1,
  pitch = 2,
  pitch_negative = 3,
  yaw = 4,
  yaw_negative = 5
}

export enum Orientation {
  unknown = 0,
  top_up = 1,
  bottom_up = 2,
  left_up = 3,
  right_up = 4,
  front_up = 5,
  back_up = 6
}

export enum BatteryState {
  unknown = 0,
  normal = 2,
  critical = 3
}

export enum ConnectionState {
  disconnected = 0,
  connecting = 1,
  discovering_services = 2,
  ready = 3,
  error = 4
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
  'orientation-unknown',
  'orientation-top',
  'orientation-bottom',
  'orientation-left',
  'orientation-right',
  'orientation-front',
  'orientation-back',
  'reactive'
]

export enum LightType {
  neoPixel = 0,
  ws2813 = 1,
  sk6812 = 2,
  sk6812_rgbw = 3,
  dotStar = 4
}

export type LightEffect = {
  region: string
  effect: string
  reverse?: boolean
}

export type LightEffectData = {
  name: string,
  type: number,
  description?: string,
  params: LightEffectDataParams[]
}

export type LightEffectDataParams = {
  name: string,
  description?: string,
  type: LightEffectDataParamType,
  required: boolean,
}

export type LightEffectDataParamType = 'string' | 'number' | 'float' | 'uint8' | 'color' | 'attitudeAxis' | 'accelerationAxis'

export type ActionProfile = Record<keyof ActionsText, LightEffect[]>

export type MotionProfile = {
  autoOrientation?: boolean
  autoMotion?: boolean
  autoTurn?: boolean
  motionAxis?: AccelerationAxis
  turnAxis?: AttitudeAxis
  brakeThreshold?: number
  accelerationThreshold?: number
  orientationAxis?: Orientation
  orientationUpMin?: number
  orientationUpMax?: number
}

export type ChannelProfile = {
  channel: number
  leds: number
  type: LightType
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