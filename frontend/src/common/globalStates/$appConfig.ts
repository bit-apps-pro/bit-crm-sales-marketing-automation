import { getColorPreference } from '@common/helpers/globalHelpers'
import config from '@config/config'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'
import { atomWithStorage } from 'jotai/utils'
import { type SyncStorage } from 'jotai/vanilla/utils/atomWithStorage'

interface AppConfigType {
  homeCurrencyData: CurrencyItemType
  isDarkTheme: boolean
  isPro: boolean
  isSidebarCollapsed: boolean
  isWpMenuCollapsed: boolean
  onboardingCompleted: boolean
  preferNodeDetailsInDrawer: boolean
}

const $appConfig = atomWithStorage(
  `${config.PLUGIN_SLUG}-config`,
  {
    homeCurrencyData: config.HOME_CURRENCY_DATA,
    isDarkTheme: getColorPreference(),
    isPro: config.IS_PRO,
    isSidebarCollapsed: false,
    isWpMenuCollapsed: false,
    onboardingCompleted: config.ONBOARDING_COMPLETED,
    preferNodeDetailsInDrawer: false
  },
  {
    getItem: (key: string) => {
      const value = localStorage.getItem(key)
      const savedValue = value ? JSON.parse(value) : undefined

      return {
        ...(savedValue as Partial<AppConfigType>),
        homeCurrencyData: config.HOME_CURRENCY_DATA,
        isPro: config.IS_PRO,
        onboardingCompleted: config.ONBOARDING_COMPLETED
      }
    },
    removeItem: (key: string) => {
      localStorage.removeItem(key)
    },
    setItem: (key: string, newValue: Partial<AppConfigType>) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    }
  } as SyncStorage<AppConfigType>
)

export default $appConfig
