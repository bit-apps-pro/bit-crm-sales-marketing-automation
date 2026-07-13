import { __ } from '@common/helpers/i18nWrap'

import { type CreateMinMaxValidator } from './types'

export const createMinMaxValidator: CreateMinMaxValidator = (form, compareFieldName, validationType) => {
  return (_, value) => {
    if (value === undefined || value === null) {
      return Promise.resolve()
    }

    const compareValue = form.getFieldValue(compareFieldName)

    if (compareValue === undefined || compareValue === null) {
      return Promise.resolve()
    }

    if (validationType === 'min' && value > compareValue) {
      return Promise.reject(new Error(__('Cannot exceed maximum')))
    }

    if (validationType === 'max' && value < compareValue) {
      return Promise.reject(new Error(__('Cannot be less than minimum')))
    }

    return Promise.resolve()
  }
}
