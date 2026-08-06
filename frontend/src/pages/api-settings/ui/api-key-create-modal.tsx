import { MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import config from '@config/config'
import LookupFieldSelect from '@features/lookup-field-select'
import If from '@utilities/If'
import { Alert, Form, Input, Modal, Space, Typography } from 'antd'
import { useState } from 'react'

import useCreateApiKey from '../data/use-create-api-key'
import { type CreatedApiKeyType } from '../shared/api-settings-type'

interface Props {
  onClose: () => void
  open: boolean
}

export default function ApiKeyCreateModal({ onClose, open }: Props) {
  const [form] = Form.useForm()
  const { createApiKey, isCreatingApiKey } = useCreateApiKey(form)

  /* The plaintext key exists only in this response. Held here so it can be shown
   * once, and dropped when the modal closes -- it can never be shown again. */
  const [createdKey, setCreatedKey] = useState<CreatedApiKeyType | undefined>()

  const handleClose = () => {
    form.resetFields()
    setCreatedKey(undefined)
    onClose()
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const { data } = await createApiKey(values)

    setCreatedKey(data)
  }

  return (
    <Modal
      cancelButtonProps={{ style: createdKey ? { display: 'none' } : undefined }}
      destroyOnHidden
      maskClosable={false}
      okButtonProps={{
        disabled: isCreatingApiKey,
        loading: isCreatingApiKey
      }}
      okText={createdKey ? __('Done') : __('Create')}
      onCancel={handleClose}
      onOk={createdKey ? handleClose : handleSubmit}
      open={open}
      title={createdKey ? __('Copy your API key') : __('Create API Key')}
    >
      <If conditions={open}>
        {createdKey ? (
          <Space className="w-full" direction="vertical" size="middle">
            <Alert
              description={__(
                'This key is shown only once. Copy it now — it cannot be retrieved again after you close this dialog.'
              )}
              message={__('Copy it before closing')}
              showIcon
              type="warning"
            />
            <Space direction="vertical" size={4}>
              <Typography.Text type="secondary">{__('User')}</Typography.Text>
              <Typography.Text strong>{createdKey.userName}</Typography.Text>
            </Space>

            <Space direction="vertical" size={4}>
              <Typography.Text type="secondary">{__('Key name')}</Typography.Text>
              <Typography.Text strong>{createdKey.name}</Typography.Text>
            </Space>

            <Space direction="vertical" size={4}>
              <Typography.Text type="secondary">{__('API key')}</Typography.Text>
              <Typography.Text code copyable>
                {createdKey.password}
              </Typography.Text>
            </Space>

            <Typography.Text type="secondary">
              {__('Use it as the password with HTTP Basic authentication.')}
            </Typography.Text>
          </Space>
        ) : (
          <Form className="mt-4" form={form} layout="vertical">
            <Form.Item
              label={__('User')}
              name="userId"
              rules={[{ message: __('Please select a user'), required: true }]}
            >
              <LookupFieldSelect
                placeholder={__('Select a CRM user')}
                queryParams={{ role_filter: config.PLUGIN_SLUG }}
                relatedModule={MODULES.USER}
                showAddNew={false}
              />
            </Form.Item>

            <Form.Item
              label={__('Key name')}
              name="name"
              rules={[{ message: __('Please enter a name'), required: true }]}
            >
              <Input placeholder={__('e.g. Zapier integration')} />
            </Form.Item>

            <Alert
              description={__(
                'A key created for an administrator has full CRM access and cannot be limited by capabilities, because administrators bypass permission checks. To restrict what a key can do, create it for a non-administrator user.'
              )}
              message={__('Choosing an administrator')}
              showIcon
              type="warning"
            />
          </Form>
        )}
      </If>
    </Modal>
  )
}
