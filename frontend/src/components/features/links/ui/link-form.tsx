import { __ } from '@common/helpers/i18nWrap'
import MentionInput from '@features/mention-input'
import { Form, Input } from 'antd'
import { type FormInstance } from 'antd'

import { type FieldOptionsType } from '../../notes/shared/note-types'

interface LinkFormProps {
  fieldOptions: FieldOptionsType[]
  form: FormInstance
}

export default function LinkForm({ fieldOptions, form }: LinkFormProps) {
  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label={__('Title')}
        name="title"
        rules={[{ message: __('Please input title!'), required: true }]}
      >
        <Input placeholder={__('Input title')} />
      </Form.Item>
      <Form.Item
        extra={__('Type # to access record field values.')}
        label={__('Link')}
        name="link"
        rules={[{ message: __('Please input link!'), required: true }]}
      >
        <MentionInput options={fieldOptions} placeholder={__('Input link')} split="" />
      </Form.Item>
      <Form.Item label={__('Description')} name="description" rules={[]}>
        <Input.TextArea autoSize={{ maxRows: 6, minRows: 2 }} placeholder={__('Input description')} />
      </Form.Item>
    </Form>
  )
}
