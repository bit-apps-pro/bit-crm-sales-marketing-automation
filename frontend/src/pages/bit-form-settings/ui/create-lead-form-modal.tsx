import { MODULES } from '@common/constants/modules'
import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import useTags from '@common/hooks/use-tags'
import { Button, Form, Input, Modal, Result, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useContext, useState } from 'react'

import useCreateLeadForm from '../data/use-create-lead-form'
import { DEFAULT_LEAD_FORM_TEMPLATE_SLUG } from '../shared/constants'
import LeadFormTemplatePicker from './lead-form-template-picker'

interface CreateLeadFormModalProps {
  onClose: () => void
  open: boolean
}

interface CreateLeadFormValues {
  tags?: (number | string)[]
  templateSlug: string
  title: string
}

export default function CreateLeadFormModal({ onClose, open }: CreateLeadFormModalProps) {
  const [form] = useForm<CreateLeadFormValues>()
  const { messageApi } = useContext(NotifyContext)
  const [blockedUrl, setBlockedUrl] = useState<string | undefined>()

  const handleClose = () => {
    form.resetFields()
    setBlockedUrl(undefined)
    onClose()
  }

  const handleCreated = (createUrl: string) => {
    const newTab = window.open(createUrl, '_blank')

    if (!newTab) {
      setBlockedUrl(createUrl)
      return
    }

    messageApi?.info(__('Building your form in the new Bit Form tab.'))
    handleClose()
  }

  const { createLeadForm, isCreating } = useCreateLeadForm({
    onBitFormAbsent: handleClose,
    onCreated: handleCreated
  })
  const { isTagsLoading, tags } = useTags({ isEnabled: open, module: MODULES.LEAD })

  const handleSubmit = async () => {
    const values = await form.validateFields()

    const existingTagIds = new Set(tags.map(tag => String(tag.id)))

    const tagIds: number[] = []
    const newTagTitles: string[] = []

    for (const tag of values.tags ?? []) {
      const value = String(tag).trim()

      if (!value) continue

      if (existingTagIds.has(value)) {
        tagIds.push(Number(value))
      } else {
        newTagTitles.push(value)
      }
    }

    createLeadForm({
      templateSlug: values.templateSlug,
      title: values.title.trim(),
      ...(tagIds.length || newTagTitles.length
        ? {
            crm: {
              ...(tagIds.length ? { tagIds } : {}),
              ...(newTagTitles.length ? { newTagTitles } : {})
            }
          }
        : {}),
      closeAfterCreate: true,
      returnUrl: window.location.href
    })
  }

  return (
    <Modal
      destroyOnHidden
      footer={blockedUrl ? <Button onClick={handleClose}>{__('Close')}</Button> : undefined}
      okButtonProps={{ loading: isCreating }}
      okText={__('Create')}
      onCancel={handleClose}
      onOk={handleSubmit}
      open={open}
      title={__('Create form')}
    >
      {blockedUrl ? (
        <Result
          extra={
            <Button
              href={blockedUrl}
              onClick={handleClose}
              rel="noreferrer"
              target="_blank"
              type="primary"
            >
              {__('Open the form builder')}
            </Button>
          }
          status="warning"
          subTitle={__('Your browser blocked the new tab. Open the form builder manually to continue.')}
          title={__('Popup blocked')}
        />
      ) : (
        <Form
          form={form}
          initialValues={{ templateSlug: DEFAULT_LEAD_FORM_TEMPLATE_SLUG }}
          layout="vertical"
        >
          <Form.Item
            label={__('Form title')}
            name="title"
            rules={[
              { message: __('Title is required'), required: true, whitespace: true },
              { max: 50, message: __('Title must be at most 50 characters') }
            ]}
          >
            <Input maxLength={50} placeholder={__('e.g. Newsletter Signup')} showCount size="small" />
          </Form.Item>
          <Form.Item
            extra={__('Applied to every lead this form captures. Type to create a new tag.')}
            label={__('Lead tags')}
            name="tags"
          >
            <Select
              allowClear
              loading={isTagsLoading}
              mode="tags"
              options={tags.map(tag => ({ label: tag.title, value: tag.id }))}
              placeholder={__('Select or create tags (optional)')}
            />
          </Form.Item>
          <Form.Item label={__('Select a template')} name="templateSlug">
            <LeadFormTemplatePicker />
          </Form.Item>
        </Form>
      )}
    </Modal>
  )
}
