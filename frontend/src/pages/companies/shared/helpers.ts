import { __ } from '@common/helpers/i18nWrap'

export const validateFields = (values: string[]): string | undefined => {
  if (!values.includes('name')) {
    return __('The Name field must be mapped!')
  }

  if (values.includes('parent_id') && values.includes('parent_name_lookup')) {
    return __(
      'You cannot map both Parent Company (ID) and Parent Company (Name) in the same import. Please choose one.'
    )
  }

  return undefined
}
