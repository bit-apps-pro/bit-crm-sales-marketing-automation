import { Form, type FormInstance } from 'antd'

interface FieldOptionNode {
  children?: FieldOptionNode[]
  disabled?: boolean
  options?: FieldOptionNode[]
  value?: number | string
}

/**
 * Keeps CSV header -> field mapping exclusive: a field already claimed by one
 * header is disabled in every other header's dropdown.
 *
 * Returns a mapper for a row's `Select` `options` / `TreeSelect` `treeData`,
 * which walks nested groups and lookup children alike.
 */
export default function useExclusiveFieldMapping(form: FormInstance, headers: string[]) {
  const headerToFieldMap = Form.useWatch([], form)

  const isClaimedByAnotherHeader = (fieldKey: number | string | undefined, ownHeader: string) =>
    Boolean(fieldKey) &&
    headers.some(header => header !== ownHeader && headerToFieldMap?.[header] === fieldKey)

  const disableMappedFields = <T extends FieldOptionNode>(options: T[], ownHeader: string): T[] =>
    options.map(option => ({
      ...option,
      ...(option.options ? { options: disableMappedFields(option.options, ownHeader) } : {}),
      ...(option.children ? { children: disableMappedFields(option.children, ownHeader) } : {}),
      disabled: option.disabled || isClaimedByAnotherHeader(option.value, ownHeader)
    }))

  return disableMappedFields
}