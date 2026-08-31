import { drawerPlacement } from '@common/helpers/direction'
import { __ } from '@common/helpers/i18nWrap'
import { type FieldOptionsType } from '@features/notes/shared/note-types'
import QuillEditor from '@features/quill-editor'
import { FULL_TOOLBAR_CONFIG } from '@features/quill-editor/shared/toolbar-configs'
import WpMediaUploader from '@features/wp-media-uploader'
import useAttachmentStore from '@features/wp-media-uploader/state/use-attachment-store'
import customizedRequiredMark from '@utilities/customized-required-mark'
import If from '@utilities/If'
import { Button, Drawer, Form, Input, Space, Switch, Typography } from 'antd'
import { useEffect, useState } from 'react'

import useSendEmail from '../data/use-send-email'
import { type EntityModule } from '../shared/types'
import useEmailComposeStore from '../state/use-email-compose-store'
import EmailRecipientField from './email-recipient-field'

interface EmailComposeDrawerProps {
  email: string
  entityId: number
  fieldOptions: FieldOptionsType[]
  module: EntityModule
}

interface MentionItem {
  [key: string]: unknown
  id: string
  value: string
}

const getMentionOptions = (options: FieldOptionsType[]) => ({
  listItemClass: 'quill-mention-list-item',
  mentionContainerClass: 'quill-mention-container',
  mentionDenotationChars: ['#'],
  mentionListClass: 'pt-1 px-1',
  positioningStrategy: 'fixed' as const,
  renderItem: function (item: MentionItem) {
    return (item.label as string) || item.value
  },
  showDenotationChar: false,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  source: function (searchTerm: string, renderList: Function) {
    const matches = options
      .filter(option => option.value.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(option => ({
        id: option.value,
        label: option.label,
        value: option.value
      }))
    renderList(matches, searchTerm)
  }
})

/** Reply subjects keep one "Re:" however many times a thread bounces. */
const replySubject = (subject: string) => {
  const trimmed = subject.trim()

  return /^re:/i.test(trimmed) ? trimmed : `Re: ${trimmed}`
}

export default function EmailComposeDrawer({
  email,
  entityId,
  fieldOptions,
  module
}: EmailComposeDrawerProps) {
  const { handleComposeClose, isComposeOpen, replyTo } = useEmailComposeStore()
  const { attachments, clearAttachments } = useAttachmentStore()
  const [form] = Form.useForm()
  const [isCcBccVisible, setIsCcBccVisible] = useState(false)
  const { isSendingEmail, sendEmail } = useSendEmail(form)

  useEffect(() => {
    if (replyTo) {
      form.setFieldsValue({ subject: replySubject(replyTo.subject) })
    }
  }, [form, replyTo])

  const handleClose = () => {
    handleComposeClose()
    form.resetFields()
    clearAttachments()
    setIsCcBccVisible(false)
  }

  const handleCcBccToggle = (checked: boolean) => {
    // Clear on hide so a collapsed field is never silently sent.
    if (!checked) {
      form.setFieldsValue({ bcc: undefined, cc: undefined })
    }

    setIsCcBccVisible(checked)
  }

  const handleMessageChange = (html: string) => {
    form.setFieldsValue({ message: html })
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()

    await sendEmail({
      ...values,
      attachments,
      entity_email: email,
      entity_id: entityId,
      module,
      reply_to_id: replyTo?.id
    })

    handleComposeClose()
    form.resetFields()
    clearAttachments()
    setIsCcBccVisible(false)
  }

  return (
    <Drawer
      destroyOnHidden
      extra={
        <Space>
          <Button className="rounded-full" onClick={handleClose}>
            {__('Cancel')}
          </Button>
          <Button
            className="rounded-full"
            loading={isSendingEmail}
            onClick={handleSubmit}
            type="primary"
          >
            {__('Send')}
          </Button>
        </Space>
      }
      onClose={handleClose}
      open={isComposeOpen}
      placement={drawerPlacement}
      title={replyTo ? __('Reply') : __('Compose Email')}
      width={720}
    >
      <If conditions={isComposeOpen}>
        <Form
          className="[&_.ant-form-item]:mb-4"
          form={form}
          layout="vertical"
          requiredMark={customizedRequiredMark}
        >
          <Form.Item label={__('To')}>
            <Input disabled value={email} />
            <div className="mt-2 flex items-center gap-2">
              <Switch checked={isCcBccVisible} onChange={handleCcBccToggle} size="small" />
              <Typography.Text className="text-xs" type="secondary">
                {__('Add Cc / Bcc')}
              </Typography.Text>
            </div>
          </Form.Item>
          <If conditions={isCcBccVisible}>
            <div className="grid gap-x-3 sm:grid-cols-2">
              <EmailRecipientField
                label={__('Cc')}
                name="cc"
                placeholder={__('Visible to all recipients')}
              />
              <EmailRecipientField
                label={__('Bcc')}
                name="bcc"
                placeholder={__('Hidden from other recipients')}
              />
            </div>
          </If>
          <Form.Item
            label={__('Subject')}
            name="subject"
            rules={[{ message: __('Please input subject!'), required: true }]}
          >
            <Input placeholder={__('Enter email subject')} />
          </Form.Item>
          <Form.Item
            extra={__('Type # to access record field values.')}
            label={__('Message')}
            name="message"
            rules={[{ message: __('Please input message!'), required: true }]}
          >
            <QuillEditor
              includeMention={true}
              mentionOptions={getMentionOptions(fieldOptions)}
              minHeight={200}
              onChange={handleMessageChange}
              placeholder={__('Write your message...')}
              toolbarConfig={FULL_TOOLBAR_CONFIG}
            />
          </Form.Item>
        </Form>
        <div className="mb-2">
          <WpMediaUploader />
        </div>
      </If>
    </Drawer>
  )
}
