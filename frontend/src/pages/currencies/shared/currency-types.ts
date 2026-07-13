export interface CurrencyItemType {
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

export interface CurrencyFormType {
  currency: string
  decimal_places: number
  decimal_separator: string
  exchange_rate: string
  numeral_system: string
  symbol: string
  thousand_separator: string
  thousand_separator_selector: string
}

export interface CurrencyStaticDataType {
  decimal_places: number
  decimal_separator: string
  iso_code: string
  label: string
  numeral_system: string
  symbol: string[]
  thousand_separator: string
  value: string
}

export interface ResponseDataType {
  homeCurrency: null | string
  homeCurrencyData: [] | CurrencyItemType
  otherCurrencies: CurrencyItemType[]
}
