import EntityForm from '@features/entity-form/ui/entity-form'

import { type EntityQuickCreateFormProps } from '../shared/types'

const columnSettings = {
  column_size: 1
}

export default function EntityQuickCreateForm({
  currencyData,
  fields,
  form
}: EntityQuickCreateFormProps) {
  return (
    <EntityForm
      columnSettings={columnSettings}
      currencyData={currencyData}
      enableQuickCreate={false}
      fields={fields}
      form={form}
    />
  )
}
