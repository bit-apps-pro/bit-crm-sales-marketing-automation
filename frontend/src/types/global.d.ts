declare module 'i18nwrap'
declare module 'incstr'
declare module 'postcss-csso'
declare module '*.module.css'
declare module '*.module.scss'
declare module '*.module.sass'
declare module '*.svg'
declare module '*.png'
declare module '*.json'

declare module 'deepmerge-alt'
declare module 'bitapps-dev-utils'

declare let wp

declare const SERVER_VARIABLES: {
  ajaxURL: string
  apiURL: string
  assetsURL: string
  baseURL: string
  capabilities: string[]
  currentUserId?: string
  dateFormat: string
  homeCurrencyData: {
    currency: string
    decimal_places: number
    decimal_separator: string
    exchange_rate?: string
    is_active?: boolean
    is_home?: boolean
    label: string
    numeral_system: string
    symbol: string
    thousand_separator: string
  }
  isPro: string
  isProExist?: string
  key?: string
  loggedInUserName: string
  nonce: string
  onboardingCompleted?: string
  pluginSlug: string
  proApiURL?: string
  proPluginVersion: string
  proSlug: string
  rootURL: string
  routePrefix: string
  settings: string
  siteBaseURL: string
  siteUrl: string
  slug: string
  timeFormat: string
  timeZone: string
  uploadBaseUrl: string
  version: string
}

type KeyedValueHandler<T> = <K extends keyof T>(key: K, value: T[K]) => void

type NestedKeyOf<T> = {
  [K in keyof T]: T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` | `${K}` : `${K}`
}[keyof T]

type ValidationType<T> = Record<NestedKeyOf<T>, string[]>

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type Builtin = Date | Error | Function | Primitive | RegExp
type DeepReadonly<T> = T extends Builtin
  ? T
  : T extends Map<infer K, infer V>
    ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
    : T extends ReadonlyMap<infer K, infer V>
      ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
      : T extends WeakMap<infer K, infer V>
        ? WeakMap<DeepReadonly<K>, DeepReadonly<V>>
        : T extends Set<infer U>
          ? ReadonlySet<DeepReadonly<U>>
          : T extends ReadonlySet<infer U>
            ? ReadonlySet<DeepReadonly<U>>
            : T extends WeakSet<infer U>
              ? WeakSet<DeepReadonly<U>>
              : T extends Promise<infer U>
                ? Promise<DeepReadonly<U>>
                : T extends object
                  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
                  : T
type Primitive = bigint | boolean | null | number | string | symbol | undefined
