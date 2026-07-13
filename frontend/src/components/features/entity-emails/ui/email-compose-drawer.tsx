import { __ } from '@common/helpers/i18nWrap'
import { type FieldOptionsType } from '@features/notes/shared/note-types'
import QuillEditor from '@features/quill-editor'
import WpMediaUploader from '@features/wp-media-uploader'
import useAttachmentStore from '@features/wp-media-uploader/state/use-attachment-store'
import customizedRequiredMark from '@utilities/customized-required-mark'
import If from '@utilities/If'
import { Button, Drawer, Form, Input, Space } from 'antd'

import useSendEmail from '../data/use-send-email'
import { type EntityModule } from '../shared/types'
import useEmailComposeStore from '../state/use-email-compose-store'

interface EmailComposeDrawerProps {
  email: string
  entityId: number
  fieldOptions: FieldOptionsType[]
  module: EntityModule
}

const quillEditorToolbarConfig = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ align: [] }],
  ['blockquote'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link'],
  ['image'],
  ['clean']
]

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

export default function EmailComposeDrawer({
  email,
  entityId,
  fieldOptions,
  module
}: EmailComposeDrawerProps) {
  const { handleComposeClose, isComposeOpen } = useEmailComposeStore()
  const { attachments, clearAttachments } = useAttachmentStore()
  const [form] = Form.useForm()
  const { isSendingEmail, sendEmail } = useSendEmail(form)

  const handleClose = () => {
    handleComposeClose()
    form.resetFields()
    clearAttachments()
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
      module
    })

    handleComposeClose()
    form.resetFields()
    clearAttachments()
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
      title={__('Compose Email')}
      width={720}
    >
      <If conditions={isComposeOpen}>
        <Form form={form} layout="vertical" requiredMark={customizedRequiredMark}>
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
              toolbarConfig={quillEditorToolbarConfig}
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
