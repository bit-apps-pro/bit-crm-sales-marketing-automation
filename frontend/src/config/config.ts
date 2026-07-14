import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'

type GetServerVariableType = <K extends keyof typeof SERVER_VARIABLES>(
  key: K,
  fallback?: (typeof SERVER_VARIABLES)[K]
) => (typeof SERVER_VARIABLES)[K]

const getServerVariable: GetServerVariableType = (key, fallback) => {
  if (!key && fallback) return fallback
  if (!(key in SERVER_VARIABLES) || !SERVER_VARIABLES?.[key]) {
    console.error('🚥 Missing server variable:', key)

    if (fallback) return fallback
  }

  return SERVER_VARIABLES[key]
}

interface ConfigType {
  AJAX_URL: string
  API_URL: string
  CAPABILITIES: string[]
  CURRENT_USER_ID?: string
  DATE_FORMAT: string
  FREE_VERSION: string
  HOME_CURRENCY_DATA: CurrencyItemType
  IS_DEV: boolean
  IS_PRO: boolean
  IS_PRO_EXIST: boolean
  KEY?: string
  NONCE: string
  ONBOARDING_COMPLETED: boolean
  PLUGIN_SLUG: string
  PRO_API_URL?: string
  PRO_SLUG?: string
  PRO_VERSION?: string
  PRODUCT_NAME: string
  ROOT_URL: string
  ROUTE_PREFIX: string
  SITE_BASE_URL: string
  SITE_URL?: string
  TIME_FORMAT: string
  TIME_ZONE: string
}

const config = {
  AJAX_URL: getServerVariable('ajaxURL', 'http://bit-crm.site/wp-admin/admin-ajax.php'),
  API_URL: getServerVariable('apiURL'),
  CAPABILITIES: getServerVariable('capabilities', []),
  CURRENT_USER_ID: getServerVariable('currentUserId'),
  DATE_FORMAT: getServerVariable('dateFormat'),
  FREE_VERSION: getServerVariable('version'),
  HOME_CURRENCY_DATA: getServerVariable('homeCurrencyData'),
  IS_DEV: true,
  IS_PRO: SERVER_VARIABLES?.isPro === '1',
  IS_PRO_EXIST: getServerVariable('isProExist', '0') === '1',
  KEY: getServerVariable('key'),
  NONCE: getServerVariable('nonce', ''),
  ONBOARDING_COMPLETED: SERVER_VARIABLES?.onboardingCompleted === '1',
  PLUGIN_SLUG: getServerVariable('pluginSlug', 'bit-crm-sales-marketing-automation'),
  PRO_API_URL: getServerVariable('proApiURL'),
  PRO_SLUG: getServerVariable('proSlug'),
  PRO_VERSION: getServerVariable('proPluginVersion'),
  PRODUCT_NAME: 'Bit CRM',
  ROOT_URL: getServerVariable('rootURL', 'http://.local'),
  ROUTE_PREFIX: getServerVariable('routePrefix', 'bit_crm_'),
  SITE_BASE_URL: getServerVariable('siteBaseURL'),
  SITE_URL: getServerVariable('siteUrl'),
  TIME_FORMAT: getServerVariable('timeFormat'),
  TIME_ZONE: getServerVariable('timeZone')
} as const satisfies ConfigType

export default config
