/* eslint-disable translate-obj-prop/translate-obj-prop */

export const DEFAULT_CURRENCY = 'USD'

export const DECIMAL_PLACES_OPTIONS = [
  { label: '0', value: '0' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' }
]

export const ZERO_DECIMAL_DIGIT_SEPARATOR_KEYS = {
  INDIAN_COMMA: 'indian_comma_zero',
  INTERNATIONAL_COMMA: 'international_comma_zero',
  INTERNATIONAL_PERIOD: 'international_period_zero',
  INTERNATIONAL_SPACE: 'international_space_zero'
}

export const DIGIT_SEPARATOR_KEYS = {
  INDIAN_COMMA_PERIOD: 'indian_comma_period',
  INTERNATIONAL_COMMA_PERIOD: 'international_comma_period',
  INTERNATIONAL_PERIOD_COMMA: 'international_period_comma',
  INTERNATIONAL_SPACE_COMMA: 'international_space_comma',
  INTERNATIONAL_SPACE_PERIOD: 'international_space_period'
}

export const ZERO_DECIMAL_DIGIT_SEPARATOR_OPTIONS = [
  { label: '1,234,567', value: ZERO_DECIMAL_DIGIT_SEPARATOR_KEYS.INTERNATIONAL_COMMA },
  { label: '1.234.567', value: ZERO_DECIMAL_DIGIT_SEPARATOR_KEYS.INTERNATIONAL_PERIOD },
  { label: '1 234 567', value: ZERO_DECIMAL_DIGIT_SEPARATOR_KEYS.INTERNATIONAL_SPACE },
  { label: '12,34,567', value: ZERO_DECIMAL_DIGIT_SEPARATOR_KEYS.INDIAN_COMMA }
]

export const FORMAT_MAPPINGS = {
  // Zero decimal formats
  [ZERO_DECIMAL_DIGIT_SEPARATOR_KEYS.INDIAN_COMMA]: {
    decimal_places: 0,
    decimal_separator: 'period',
    numeral_system: 'indian',
    thousand_separator: 'comma'
  },
  [ZERO_DECIMAL_DIGIT_SEPARATOR_KEYS.INTERNATIONAL_COMMA]: {
    decimal_places: 0,
    decimal_separator: 'period',
    numeral_system: 'international',
    thousand_separator: 'comma'
  },
  [ZERO_DECIMAL_DIGIT_SEPARATOR_KEYS.INTERNATIONAL_PERIOD]: {
    decimal_places: 0,
    decimal_separator: 'period',
    numeral_system: 'international',
    thousand_separator: 'period'
  },
  [ZERO_DECIMAL_DIGIT_SEPARATOR_KEYS.INTERNATIONAL_SPACE]: {
    decimal_places: 0,
    decimal_separator: 'period',
    numeral_system: 'international',
    thousand_separator: 'space'
  },
  // Decimal formats (dynamic decimal places)
  [DIGIT_SEPARATOR_KEYS.INDIAN_COMMA_PERIOD]: {
    decimal_separator: 'period',
    numeral_system: 'indian',
    thousand_separator: 'comma'
  },
  [DIGIT_SEPARATOR_KEYS.INTERNATIONAL_COMMA_PERIOD]: {
    decimal_separator: 'period',
    numeral_system: 'international',
    thousand_separator: 'comma'
  },
  [DIGIT_SEPARATOR_KEYS.INTERNATIONAL_PERIOD_COMMA]: {
    decimal_separator: 'comma',
    numeral_system: 'international',
    thousand_separator: 'period'
  },
  [DIGIT_SEPARATOR_KEYS.INTERNATIONAL_SPACE_COMMA]: {
    decimal_separator: 'comma',
    numeral_system: 'international',
    thousand_separator: 'space'
  },
  [DIGIT_SEPARATOR_KEYS.INTERNATIONAL_SPACE_PERIOD]: {
    decimal_separator: 'period',
    numeral_system: 'international',
    thousand_separator: 'space'
  }
} as const
