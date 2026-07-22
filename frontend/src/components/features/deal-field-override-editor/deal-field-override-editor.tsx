import { generateFieldOptions } from '@common/helpers/generate-field-options'
import { __ } from '@common/helpers/i18nWrap'
import useDealFields from '@pages/deal-create/data/use-deal-fields'
import useLeadFields from '@pages/lead-create/data/use-lead-fields'
import If from '@utilities/If'
import { Button, Form, Input, Mentions, Select, Space, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { LuPlus, LuTrash2 } from 'react-icons/lu'

import { filterDealFields, getFilteredOptions, prepareFieldsAsOptions } from './shared/helpers'
import { type DealFieldOverrideEditorProps, type FieldOverride } from './shared/types'
import DealFieldInput from './ui/deal-field-input'
import DealFieldOverrideNote from './ui/deal-field-override-note'

export default function DealFieldOverrideEditor({
  form,
  initialFieldOverrides
}: DealFieldOverrideEditorProps) {
  const { fields: dealFields } = useDealFields()
  const { fields: leadFields } = useLeadFields()
  const [fieldOverrides, setFieldOverrides] = useState<FieldOverride[]>(
    () => initialFieldOverrides ?? []
  )

  const dealFieldOptions = useMemo(
    () => prepareFieldsAsOptions(filterDealFields(dealFields)),
    [dealFields]
  )

  const selectedFieldKeys = fieldOverrides.map(f => f.fieldKey).filter(Boolean)

  const allFieldsSelected = selectedFieldKeys.length >= dealFieldOptions.length

  const handleAddField = () => {
    setFieldOverrides([...fieldOverrides, { fieldKey: undefined, id: Date.now().toString() }])
  }

  const handleRemoveField = (id: string, fieldKey?: string) => {
    setFieldOverrides(fieldOverrides.filter(f => f.id !== id))

    if (fieldKey) {
      const currentOverrides = form.getFieldValue('dealFieldOverrides') || {}
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete currentOverrides[fieldKey]

      form.setFieldValue('dealFieldOverrides', currentOverrides)
    }
  }

  const handleFieldChange = (id: string, newFieldKey: string) => {
    setFieldOverrides(fieldOverrides.map(f => (f.id === id ? { ...f, fieldKey: newFieldKey } : f)))
  }

  useEffect(() => {
    form.setFieldValue('dealFields', dealFields)
  }, [dealFields, form])

  return (
    <div className="space-y-4 rounded-lg border border-solid border-gray-300 p-4">
      <Typography.Title level={5}>{__('Deal Field Overrides')}</Typography.Title>
      <DealFieldOverrideNote />

      <Form.Item
        className="mb-0"
        extra={__('Type # to access Lead field values.')}
        label={__('Deal Name')}
        name={['dealFieldOverrides', 'name']}
        rules={[{ message: __('Deal name is required'), required: true }]}
      >
        <Mentions
          options={generateFieldOptions(leadFields)}
          placeholder={__('Enter deal name')}
          prefix="#"
        />
      </Form.Item>

      <If conditions={fieldOverrides.length > 0}>
        {fieldOverrides.map(override => {
          const overrideField = dealFields.find(f => f.field_key === override?.fieldKey)

          return (
            <div className="flex" key={override.id}>
              <Space.Compact block>
                <Select
                  onChange={value => handleFieldChange(override.id, value)}
                  options={getFilteredOptions(dealFieldOptions, selectedFieldKeys, override?.fieldKey)}
                  placeholder={__('Select field')}
                  showSearch
                  style={{ flex: '1' }}
                  value={override.fieldKey}
                />
                {override.fieldKey ? (
                  <Form.Item
                    className="mb-0"
                    key={override.fieldKey}
                    name={['dealFieldOverrides', override.fieldKey]}
                    rules={[{ message: __('Value is required'), required: true }]}
                    style={{ flex: '3' }}
                  >
                    <DealFieldInput field={overrideField} />
                  </Form.Item>
                ) : (
                  <div style={{ flex: '3' }}>
                    <Input disabled placeholder={__('Select a field first')} />
                  </div>
                )}
              </Space.Compact>

              <Button
                danger
                icon={<LuTrash2 size={14} />}
                onClick={() => handleRemoveField(override.id, override.fieldKey)}
                size="large"
                type="link"
              />
            </div>
          )
        })}
      </If>

      <If conditions={!allFieldsSelected}>
        <div className="flex justify-start">
          <Button icon={<LuPlus size={14} />} onClick={handleAddField} type="dashed">
            {__('Add Field Override')}
          </Button>
        </div>
      </If>

      <Form.Item hidden name={'dealFields'}>
        <Input type="hidden" value={JSON.stringify(dealFields)} />
      </Form.Item>
    </div>
  )
}
