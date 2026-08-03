import { __ } from '@common/helpers/i18nWrap'
import { Button, Form, Input, Typography } from 'antd'
import { useEffect } from 'react'

import usePrefix from './data/use-prefix'
import useUpsertPrefix from './data/use-upsert-prefix'
import PrefixSkeleton from './prefix-skeleton'

export default function Prefix() {
  const [form] = Form.useForm()
  const { isPrefixPending, prefix } = usePrefix()
  const { isUpdatePending, upsertPrefix } = useUpsertPrefix()

  useEffect(() => {
    if (!isPrefixPending && prefix) {
      form.setFieldsValue({ prefix })
    }
  }, [prefix, isPrefixPending, form])

  const handleFinish = async (values: { prefix: string }) => {
    await upsertPrefix({ setting_key: 'invoice_prefix', setting_value: values })
  }

  return (
    <div className="max-w-2xl rounded-lg border border-solid border-[#EBEAFF] p-4 dark:border-neutral-700">
      {isPrefixPending ? (
        <PrefixSkeleton />
      ) : (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <div className="mb-2 flex items-center gap-3">
            <Typography.Text className="block font-semibold text-gray-800 dark:text-gray-100">
              {__('Invoice Prefix')}
            </Typography.Text>
          </div>

          <Form.Item
            className="mb-2 max-w-xs"
            initialValue={__('INV')}
            name="prefix"
            rules={[
              { message: __('Please provide an invoice prefix'), required: true },
              {
                message: __('Invoice prefix cannot contain spaces'),
                pattern: /^\S*$/ // Regex: No spaces allowed (only non-whitespace characters)
              }
            ]}
          >
            <Input maxLength={10} placeholder="INV" size="middle" />
          </Form.Item>

          <Typography.Text className="mb-2 block text-xs text-gray-500 dark:text-gray-400">
            {__('Enter the prefix that will appear before each invoice number.')}
          </Typography.Text>
          <ul className="mb-6 mt-1 list-disc space-y-1 pl-4 text-xs text-gray-400 dark:text-gray-500">
            <li>{__('Example: entering INV will produce invoices like INV-0001.')}</li>
            <li>{__('Maximum 10 characters allowed.')}</li>
          </ul>

          <div className="flex justify-end">
            <Button
              className="rounded-full px-6"
              htmlType="submit"
              loading={isUpdatePending}
              type="primary"
            >
              {__('Save Changes')}
            </Button>
          </div>
        </Form>
      )}
    </div>
  )
}
