import { getFilteredModuleOptions, MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import config from '@config/config'
import { PRIORITY_OPTIONS } from '@features/activity-list/shared/activity-constants'
import LookupFieldSelect from '@features/lookup-field-select'
import WpMediaUploader from '@features/wp-media-uploader'
import customizedRequiredMark from '@utilities/customized-required-mark'
import If from '@utilities/If'
import ModuleSelect from '@utilities/module-select'
import { DatePicker, Form, type FormInstance, Input, Mentions, Select } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'

import { type FieldOptionsType } from '../shared/task-types'

const FILTERED_MODULE_OPTIONS = getFilteredModuleOptions([MODULES.INVOICE])

interface TaskFormProps {
  fieldOptions?: FieldOptionsType[]
  form: FormInstance
  module?: string
  variant: 'component' | 'page'
}

export default function TaskForm({ fieldOptions, form, module: initialModule, variant }: TaskFormProps) {
  const [selectedModule, setSelectedModule] = useState<string>(initialModule || '')

  const handleModuleChange = (value: string) => {
    setSelectedModule(value)
    form.setFieldValue('entity_id', undefined)
  }

  return (
    <div>
      <Form form={form} layout="vertical" requiredMark={customizedRequiredMark}>
        <If conditions={variant === 'page'}>
          <Form.Item
            label={__('Module')}
            name="module"
            rules={[{ message: __('Please select module!'), required: true }]}
          >
            <ModuleSelect onChange={handleModuleChange} options={FILTERED_MODULE_OPTIONS} />
          </Form.Item>

          <Form.Item
            label={__('Entity')}
            name="entity_id"
            rules={[{ message: __('Please select entity!'), required: true }]}
          >
            <LookupFieldSelect relatedModule={selectedModule} showAddNew={false} />
          </Form.Item>
        </If>
        <Form.Item
          extra={variant === 'component' ? __('Type # to access record field values.') : undefined}
          label={__('Title')}
          name="title"
          rules={[{ message: __('Please input title!'), required: true }]}
        >
          {variant === 'component' && fieldOptions && fieldOptions.length > 0 ? (
            <Mentions options={fieldOptions} placeholder={__('Input title')} prefix="#" />
          ) : (
            <Input placeholder={__('Input title')} />
          )}
        </Form.Item>
        <Form.Item
          label={__('Due Date')}
          name="due_date"
          rules={[{ message: __('Please select due date!'), required: true }]}
        >
          <DatePicker
            className="w-full"
            format={'YYYY-MM-DD hh:mm A'}
            placeholder={__('Select date and time')}
            showTime={{ defaultValue: dayjs('12:00', 'hh:mm') }}
          />
        </Form.Item>
        <Form.Item
          label={__('Assigned To')}
          name="assigned_to"
          required
          rules={[{ message: __('Please select assigned to!'), required: true }]}
        >
          <LookupFieldSelect
            queryParams={{ role_filter: config.PLUGIN_SLUG }}
            refetch
            relatedModule={MODULES.USER}
            showAddNew={false}
          />
        </Form.Item>
        <Form.Item
          label={__('Priority')}
          name="priority"
          rules={[{ message: __('Please select priority!'), required: true }]}
        >
          <Select options={PRIORITY_OPTIONS} placeholder={__('Select priority')} />
        </Form.Item>
        <Form.Item
          extra={variant === 'component' ? __('Type # to access record field values.') : undefined}
          label={__('Details')}
          name="details"
          rules={[{ required: false }]}
        >
          {variant === 'component' && fieldOptions && fieldOptions.length > 0 ? (
            <Mentions
              autoSize={{ minRows: 4 }}
              options={fieldOptions}
              placeholder={__('Details...')}
              prefix="#"
            />
          ) : (
            <Input.TextArea autoSize={{ maxRows: 6, minRows: 2 }} placeholder={__('Details...')} />
          )}
        </Form.Item>
      </Form>
      <div className="mb-2">
        <WpMediaUploader />
      </div>
    </div>
  )
}
