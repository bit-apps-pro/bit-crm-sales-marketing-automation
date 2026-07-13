import { MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import config from '@config/config'
import DealFieldOverrideEditor from '@features/deal-field-override-editor'
import LookupFieldSelect from '@features/lookup-field-select'
import customizedRequiredMark from '@utilities/customized-required-mark'
import If from '@utilities/If'
import { Checkbox, Form, type FormInstance, Radio } from 'antd'

const MANDATORY_MODULE_OPTIONS = [
  { label: __('Contact'), value: MODULES.CONTACT },
  { label: __('Company'), value: MODULES.COMPANY }
]

const OPTIONAL_MODULE_OPTIONS = [{ label: __('Deal'), value: MODULES.DEAL }]

const ALL_MODULE_OPTIONS = [...MANDATORY_MODULE_OPTIONS, ...OPTIONAL_MODULE_OPTIONS]

export default function ConversionForm({ form }: { form: FormInstance }) {
  const convertTo = Form.useWatch('convertTo', form) || []
  const isDealSelected = convertTo.includes(MODULES.DEAL)

  const moveRelatedDataOptions = isDealSelected ? ALL_MODULE_OPTIONS : MANDATORY_MODULE_OPTIONS
  const moveTagsOptions = isDealSelected ? ALL_MODULE_OPTIONS : MANDATORY_MODULE_OPTIONS

  return (
    <Form className="my-4 space-y-4" form={form} layout="vertical" requiredMark={customizedRequiredMark}>
      <Form.Item
        className="mb-0"
        initialValue={[MODULES.CONTACT, MODULES.COMPANY]}
        label={__('Convert Lead To')}
        name="convertTo"
      >
        <Checkbox.Group
          options={[
            ...MANDATORY_MODULE_OPTIONS.map(option => ({ ...option, disabled: true })),
            ...OPTIONAL_MODULE_OPTIONS
          ]}
        />
      </Form.Item>

      <If conditions={isDealSelected}>
        <DealFieldOverrideEditor form={form} />
      </If>

      <Form.Item
        className="mb-0"
        initialValue={['activity', 'attachment', 'note', 'link']}
        label={__('Include Related Data')}
        name="moveRelatedData"
      >
        <Checkbox.Group
          options={[
            { label: __('Activities'), value: 'activity' },
            { label: __('Attachments'), value: 'attachment' },
            { label: __('Notes'), value: 'note' },
            { label: __('Links'), value: 'link' }
          ]}
        />
      </Form.Item>

      <Form.Item
        className="mb-0"
        initialValue={MODULES.CONTACT}
        label={__('Move Related Data To')}
        name="moveRelatedDataTo"
      >
        <Radio.Group options={moveRelatedDataOptions} />
      </Form.Item>

      <Form.Item className="mb-0" label={__('Move Tags To')} name="moveTagsTo">
        <Checkbox.Group options={moveTagsOptions} />
      </Form.Item>

      <Form.Item
        className="mb-0"
        help={__(
          'Select owner for the converted records. Otherwise, the lead owner will be assigned automatically.'
        )}
        label={__('Owner of New Records')}
        name="defaultOwnerId"
      >
        <LookupFieldSelect
          placeholder={__('The Lead owner will be assigned, by default.')}
          queryParams={{ role_filter: config.PLUGIN_SLUG }}
          refetch
          relatedModule={MODULES.USER}
          showAddNew={false}
        />
      </Form.Item>
    </Form>
  )
}
