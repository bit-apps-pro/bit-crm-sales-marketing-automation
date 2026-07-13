import atomWithBroadcast from '@common/helpers/atomWithBroadcast'

export type AuthCodeResponseType = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const $shareOauthInfo = atomWithBroadcast<AuthCodeResponseType>('shareOauthInfo', {})

export default $shareOauthInfo
