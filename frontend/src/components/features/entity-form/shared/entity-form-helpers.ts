import { __ } from '@common/helpers/i18nWrap'
import { type FormInstance } from 'antd'
import { type Rule } from 'antd/lib/form'
import { startCase } from 'lodash'

/**
 * Extracts the last segment from a dot-separated path.
 * @param dotPath - Dot-notation path (e.g., "user.profile.name")
 * @returns Last segment of the path or the original string if no dots
 */
const getFieldName = (dotPath: string) => {
  const segments = dotPath.split('.')
  return segments.at(-1) || dotPath
}

/**
 * Sets validation errors on form fields with formatted error messages.
 * @param form - Ant Design form instance
 * @param error - Validation errors object with field names as keys and error messages as values
 * @returns Form instance with errors applied
 */
export const setFormErrors = (form: FormInstance, error: ValidationType<Record<string, string[]>>) => {
  const formErrors = Object.entries(error).map(([key, messages]) => ({
    errors: messages?.map(msg => startCase(getFieldName(msg))) || [],
    name: getFieldName(key)
  }))

  return form.setFields(formErrors)
}

export const getValidationRules = (label: string, type: string, required: boolean) => {
  const rules: Rule[] = []

  if (required) {
    rules.push({ message: __(`${label} is required`), required })
  }

  if (type === 'email') {
    rules.push({
      message: __('Please enter a valid email address'),
      type
    })
  }

  if (type === 'url') {
    rules.push({
      message: __('Please enter a valid URL'),
      type
    })
  }

  return rules
}
