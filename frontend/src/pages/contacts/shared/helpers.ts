import { __ } from '@common/helpers/i18nWrap'

export const validateFields = (values: string[]): string | undefined => {
  if (!values.includes('last_name')) {
    return __('The Last Name field must be mapped!')
  }

  if (values.includes('company_id') && values.includes('company_name_lookup')) {
    return __(
      'You cannot map both Company (ID) and Company (Name) in the same import. Please choose one.'
    )
  }

  if (values.includes('parent_id') && values.includes('parent_name_lookup')) {
    return __(
      'You cannot map both Reports To (ID) and Reports To (Name) in the same import. Please choose one.'
    )
  }

  return undefined
}
