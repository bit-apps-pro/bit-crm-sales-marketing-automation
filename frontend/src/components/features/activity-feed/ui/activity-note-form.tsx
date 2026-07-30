import { __ } from '@common/helpers/i18nWrap'
import QuillEditor from '@features/quill-editor'
import customizedRequiredMark from '@utilities/customized-required-mark'
import { Form, type FormInstance } from 'antd'

const quillEditorToolbarConfig = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote'],
  [{ list: 'ordered' }, { list: 'bullet' }]
]

interface ActivityNoteFromProps {
  detailsValue?: string
  form: FormInstance
  isEditing?: boolean
}

export default function ActivityNoteForm({ detailsValue, form, isEditing }: ActivityNoteFromProps) {
  if (isEditing) {
    form.setFieldValue('details', detailsValue)
  }

  const handleDetailsChange = (html: string) => {
    if (!html.replaceAll(/<(.|\n)*?>/g, '').length) {
      form.setFieldsValue({ details: '' })
      return
    }
    form.setFieldsValue({ details: html })
  }
  return (
    <Form form={form} layout="vertical" requiredMark={customizedRequiredMark}>
      <Form.Item name="details" rules={[{ message: __('Note is required'), required: true }]}>
        <QuillEditor
          defaultValue={detailsValue ?? ''}
          onChange={handleDetailsChange}
          toolbarConfig={quillEditorToolbarConfig}
        />
      </Form.Item>
    </Form>
  )
}
