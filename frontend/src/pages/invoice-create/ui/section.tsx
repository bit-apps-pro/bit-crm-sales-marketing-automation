// import { useInvoiceActions } from '../state/use-invoices-create-store'

import QuillEditor from '@features/quill-editor'
import { MINIMAL_TOOLBAR_CONFIG } from '@features/quill-editor/shared/toolbar-configs'
import { Typography } from 'antd'

import { useInvoiceCreateStoreActions } from '../state/use-invoice-create-store'

interface SectionProps {
  index: number
  label?: string
  position: 'bottom' | 'top'
  value?: string
}

export default function Section({ index, label, position, value }: SectionProps) {
  const { updateSectionLabel, updateSectionValue } = useInvoiceCreateStoreActions()
  return (
    <div>
      <Typography.Text
        editable={{
          onChange: label => {
            updateSectionLabel(position, index, label)
          },
          triggerType: ['icon', 'text']
        }}
      >
        {label}
      </Typography.Text>

      <QuillEditor
        defaultValue={value}
        key={index}
        onChange={value => {
          updateSectionValue(position, index, value)
        }}
        toolbarConfig={MINIMAL_TOOLBAR_CONFIG}
      />
    </div>
  )
}
