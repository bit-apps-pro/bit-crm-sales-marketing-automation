import { type FieldItem } from '@features/field-settings/shared/field-types'
import { useCallback } from 'react'

import useStates from './use-states'

const getCell = <Row extends object>(row: Row, key?: string) =>
  row[key as keyof Row] as unknown as string

export default function useAddressLabels<Row extends object>(fieldList: FieldItem[], rows: Row[]) {
  const { getStateLabel } = useStates(
    fieldList
      .filter(field => field.is_visible && field.country_field)
      .flatMap(field => rows.map(row => getCell(row, field.country_field)))
  )

  return useCallback(
    (field: FieldItem, record: Row, text: string): string | undefined => {
      if (field.is_country) {
        return field.options?.find(option => option.value === text)?.label ?? text
      }

      return field.country_field ? getStateLabel(getCell(record, field.country_field), text) : undefined
    },
    [getStateLabel]
  )
}
