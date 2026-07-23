import { MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import QuillEditor from '@features/quill-editor'
import ShareWithContact from '@features/share-with-contact'
import WpMediaUploader from '@features/wp-media-uploader'
import customizedRequiredMark from '@utilities/customized-required-mark'
import If from '@utilities/If'
import { type FormInstance } from 'antd'
import { Form, Input, Mentions } from 'antd'

import { type FieldOptionsType } from '../shared/note-types'

interface NoteFormProps {
  detailsValue?: string
  entityId?: number | string
  fieldOptions: FieldOptionsType[]
  form: FormInstance
  module: string
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

const quillEditorToolbarConfig = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote'],
  [{ list: 'ordered' }, { list: 'bullet' }]
]

export default function NoteForm({ detailsValue, entityId, fieldOptions, form, module }: NoteFormProps) {
  const handleDetailsChange = (html: string) => {
    form.setFieldsValue({ details: html })
  }

  return (
    <div>
      <Form form={form} layout="vertical" requiredMark={customizedRequiredMark}>
        <Form.Item
          extra={__('Type # to access record field values.')}
          label={__('Title')}
          name="title"
          rules={[{ message: __('Please input title!'), required: true }]}
        >
          <Mentions options={fieldOptions} placeholder={__('Input title')} prefix="#" />
        </Form.Item>
        <Form.Item
          extra={__('Type # to access record field values.')}
          label={__('Details')}
          rules={[{ required: false }]}
        >
          <QuillEditor
            defaultValue={detailsValue ?? ''}
            includeMention={true}
            mentionOptions={getMentionOptions(fieldOptions)}
            onChange={handleDetailsChange}
            toolbarConfig={quillEditorToolbarConfig}
          />
        </Form.Item>
        <Form.Item hidden name="details">
          <Input type="hidden" />
        </Form.Item>
        <If conditions={module === MODULES.CONTACT}>
          <ShareWithContact
            capability="notes"
            entityId={entityId}
            form={form}
            sharedText={__('Contact will have access to this note.')}
            unsharedText={__('Only you and your team can see this note.')}
          />
        </If>
      </Form>
      <div className="mb-2">
        <WpMediaUploader />
      </div>
    </div>
  )
}
