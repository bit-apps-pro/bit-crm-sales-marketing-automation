import { DIGIT_SEPARATOR_KEYS, ZERO_DECIMAL_DIGIT_SEPARATOR_OPTIONS } from './constants'
import { type CurrencyItemType, type CurrencyStaticDataType } from './currency-types'

export const getDecimalPart = (places: number): string => {
  if (places <= 0) return ''
  if (places === 1) return '.8'
  return '.8' + '9'.repeat(places - 1)
}

export const getDigitSeparatorOptions = (decimalPlaces: number | string) => {
  const isZeroDecimal = Number(decimalPlaces) === 0

  if (isZeroDecimal) return ZERO_DECIMAL_DIGIT_SEPARATOR_OPTIONS

  const decimalPart = getDecimalPart(Number(decimalPlaces))
  const decimalPartForComma = decimalPart.slice(1) // Remove the period for comma format

  return [
    { label: `1,234,567${decimalPart}`, value: DIGIT_SEPARATOR_KEYS.INTERNATIONAL_COMMA_PERIOD },
    {
      label: `1.234.567,${decimalPartForComma}`,
      value: DIGIT_SEPARATOR_KEYS.INTERNATIONAL_PERIOD_COMMA
    },
    { label: `1 234 567${decimalPart}`, value: DIGIT_SEPARATOR_KEYS.INTERNATIONAL_SPACE_PERIOD },
    { label: `1 234 567,${decimalPartForComma}`, value: DIGIT_SEPARATOR_KEYS.INTERNATIONAL_SPACE_COMMA },
    { label: `12,34,567${decimalPart}`, value: DIGIT_SEPARATOR_KEYS.INDIAN_COMMA_PERIOD }
  ]
}

export const getFormatKeyByCurrency = (currency: CurrencyItemType | CurrencyStaticDataType) => {
  const numeralSystem = currency.numeral_system.toLowerCase()
  const thousandSeparator = currency.thousand_separator.toLowerCase()
  const decimalSeparator = Number(currency.decimal_places) === 0 ? 'zero' : currency.decimal_separator

  return `${numeralSystem}_${thousandSeparator}_${decimalSeparator}`
}

export const getPreviewByFormatKey = (formatKey: string, decimalPlaces: number | string) => {
  const options = getDigitSeparatorOptions(decimalPlaces)

  const option = options.find(opt => opt.value === formatKey)
  return option ? option.label : ''
}

export const generateCurrencyFormatPreview = (
  currency: CurrencyItemType,
  number = 0,
  includeSymbol = true
) => {
  let sampleNumber = number
  if (typeof number === 'string') sampleNumber = Number(number)
  const decimalPlaces = Number(currency.decimal_places)
  const thousandSeparator = currency.thousand_separator
  const decimalSeparator = currency.decimal_separator
  const numeralSystem = currency.numeral_system
  const symbol = currency.symbol

  const roundedNumber =
    decimalPlaces === 0 ? Math.round(sampleNumber) : Number(sampleNumber.toFixed(decimalPlaces))

  const parts = roundedNumber.toString().split('.')
  let integerPart = parts[0]
  const decimalPart = parts[1] || ''

  if (numeralSystem === 'indian') {
    // Regex for Indian numbering system (1,23,45,678): matches a digit followed by groups of 2 digits, then a final group of 3 digits
    const regex = /(\d)(?=(\d{2})+(\d{3})+$)/g
    integerPart = integerPart.replaceAll(regex, '$1,')
  } else {
    // Regex for international numbering system (1,234,567): matches word boundaries before groups of 3 digits
    const regex = /\B(?=(\d{3})+(?!\d))/g
    if (thousandSeparator === 'comma') {
      integerPart = integerPart.replaceAll(regex, ',')
    } else if (thousandSeparator === 'period') {
      integerPart = integerPart.replaceAll(regex, '.')
    } else if (thousandSeparator === 'space') {
      integerPart = integerPart.replaceAll(regex, ' ')
    }
  }

  if (decimalPlaces === 0) {
    return `${symbol} ${integerPart}`
  }

  const paddedDecimalPart = decimalPart.padEnd(decimalPlaces, '0')
  const separator = decimalSeparator === 'comma' ? ',' : '.'

  return includeSymbol
    ? `${symbol} ${integerPart}${separator}${paddedDecimalPart}`
    : `${integerPart}${separator}${paddedDecimalPart}`
}
