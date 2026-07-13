import { __ } from '@common/helpers/i18nWrap'

export const validateFields = (values: string[]): string | undefined => {
  if (!values.includes('name')) {
    return __('The Name field must be mapped!')
  }

  if (!values.includes('stage')) {
    return __('The Stage field must be mapped!')
  }

  if (!values.includes('contact_id') && !values.includes('contact_name_lookup')) {
    return __('The Contact field must be mapped!')
  }

  if (values.includes('company_id') && values.includes('company_name_lookup')) {
    return __(
      'You cannot map both Company (ID) and Company (Name) in the same import. Please choose one.'
    )
  }

  if (values.includes('contact_id') && values.includes('contact_name_lookup')) {
    return __(
      'You cannot map both Contact (ID) and Contact (Name) in the same import. Please choose one.'
    )
  }

  return undefined
}
