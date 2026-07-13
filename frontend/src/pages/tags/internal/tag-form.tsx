import { getFilteredModuleOptions, MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import ModuleSelect from '@utilities/module-select'
import { Form, Input, Skeleton } from 'antd'
import { type FormInstance } from 'antd/lib/form'

export const FILTERED_MODULE_OPTIONS = getFilteredModuleOptions([MODULES.INVOICE])

export default function TagForm({
  form,
  isLoading = false
}: {
  form: FormInstance
  isLoading?: boolean
}) {
  return (
    <Form className="pt-2" form={form} layout="vertical">
      <Form.Item
        label={__('Title')}
        name="title"
        rules={[
          {
            message: __('The title field is required!'),
            required: true
          }
        ]}
      >
        {isLoading ? <Skeleton.Input active className="w-full" /> : <Input />}
      </Form.Item>
      <Form.Item
        label={__('Module')}
        name="module"
        rules={[
          {
            message: __('The module field is required!'),
            required: true
          }
        ]}
      >
        {isLoading ? (
          <Skeleton.Input active className="w-full" />
        ) : (
          <ModuleSelect options={FILTERED_MODULE_OPTIONS} />
        )}
      </Form.Item>
    </Form>
  )
}
