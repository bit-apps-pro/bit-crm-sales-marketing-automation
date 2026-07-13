import { type BaseFieldItemType } from '@features/entity-form/shared/entity-form-types'

import { __ } from './i18nWrap'

interface TreeNode {
  children?: { title: string; value: number | string }[]
  disabled?: boolean
  isLeaf?: boolean
  selectable?: boolean
  title: string
  value: number | string
}

export type GenerateLookupFieldsOptions = (
  systemDefinedFields: BaseFieldItemType[],
  customFields: BaseFieldItemType[],
  lookupFields: Record<
    string,
    {
      label: string
      targetIdLabel: string
      targetIdValue: string
      targetNameLabel: string
      targetNameValue: string
    }
  >
) => TreeNode[]

export const generateLookupFieldsOptions: GenerateLookupFieldsOptions = (
  systemDefinedFields,
  customFields,
  lookupFields
) => {
  const result: TreeNode[] = []

  if (systemDefinedFields?.length > 0) {
    result.push({
      disabled: true,
      isLeaf: true,
      title: __('System Defined Fields'),
      value: 'system_label'
    })

    systemDefinedFields.forEach(field => {
      const fieldKey = field?.field_key
      if (fieldKey in lookupFields) {
        result.push({
          children: [
            {
              title: lookupFields[fieldKey]?.targetIdLabel,
              value: lookupFields[fieldKey]?.targetIdValue
            },
            {
              title: lookupFields[fieldKey]?.targetNameLabel,
              value: lookupFields[fieldKey]?.targetNameValue
            }
          ],
          selectable: false,
          title: field?.label,
          value: `${fieldKey}_parent`
        })
      } else {
        result.push({ isLeaf: true, title: field?.label, value: field?.field_key })
      }
    })
  }

  if (customFields?.length > 0) {
    result.push({ disabled: true, isLeaf: true, title: __('Custom Fields'), value: 'custom_label' })

    customFields.forEach(field => {
      result.push({ isLeaf: true, title: field?.label, value: field?.field_key })
    })
  }

  return result
}
