import { getFilteredModuleOptions, MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import config from '@config/config'
import LookupFieldSelect from '@features/lookup-field-select'
import ShareWithContact from '@features/share-with-contact'
import WpMediaUploader from '@features/wp-media-uploader'
import customizedRequiredMark from '@utilities/customized-required-mark'
import If from '@utilities/If'
import ModuleSelect from '@utilities/module-select'
import { DatePicker, Form, type FormInstance, Input, Mentions } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'

import { type FieldOptionsType } from '../shared/call-types'

const FILTERED_MODULE_OPTIONS = getFilteredModuleOptions([MODULES.INVOICE])

interface CallFormProps {
  entityId?: number
  fieldOptions?: FieldOptionsType[]
  form: FormInstance
  initialValues?: Record<string, unknown>
  module?: string
  variant: 'component' | 'page'
}

export default function CallForm({
  entityId,
  fieldOptions,
  form,
  initialValues,
  module: initialModule,
  variant
}: CallFormProps) {
  const [selectedModule, setSelectedModule] = useState<string>(initialModule || '')
  const watchedEntityId = Form.useWatch('entity_id', form)
  const prevEntityIdRef = useRef(watchedEntityId)

  useEffect(() => {
    if (prevEntityIdRef.current !== undefined && prevEntityIdRef.current !== watchedEntityId) {
      form.setFieldValue('is_shared', false)
    }
    prevEntityIdRef.current = watchedEntityId
  }, [watchedEntityId, form])

  const handleModuleChange = (value: string) => {
    setSelectedModule(value)
    form.setFieldValue('entity_id', undefined)
  }

  return (
    <div className="space-y-2">
      <Form
        form={form}
        initialValues={initialValues}
        layout="vertical"
        requiredMark={customizedRequiredMark}
      >
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
            <LookupFieldSelect
              disabled={selectedModule === ''}
              relatedModule={selectedModule}
              showAddNew={false}
            />
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
            minDate={dayjs().startOf('day')}
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
        <If conditions={initialModule === MODULES.CONTACT || selectedModule === MODULES.CONTACT}>
          <ShareWithContact
            capability="calls"
            entityId={entityId ?? watchedEntityId}
            form={form}
            sharedText={__('Contact will have access to this call.')}
            unsharedText={__('Only you and your team can see this call.')}
          />
        </If>
      </Form>
      <div className="mb-2">
        <WpMediaUploader />
      </div>
    </div>
  )
}
