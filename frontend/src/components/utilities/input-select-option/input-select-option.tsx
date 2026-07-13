import { slugify } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { type FormInstance, Input } from 'antd'
import { Button, Form } from 'antd'
import { type ChangeEvent } from 'react'
import { LuPlus, LuTrash2 } from 'react-icons/lu'

interface IProps {
  form: FormInstance
}

const InputSelectOption = ({ form }: IProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>, name: number) => {
    const newSlug = slugify(e.target.value)

    const currentOptions = form.getFieldValue('options') || []

    const updatedOptions = currentOptions.map((item: Record<string, unknown>, index: number) =>
      index === name ? { ...item, value: newSlug } : item
    )

    form.setFieldsValue({ options: updatedOptions })
  }

  return (
    <>
      <label className="mt-3 block font-normal" htmlFor="options">
        {__('Field value options')}
      </label>
      <Form.List initialValue={[{ label: __(''), value: '' }]} name="options">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <div className="flex items-end gap-2" key={key}>
                <Form.Item
                  {...restField}
                  className="mb-0"
                  label={__('Label')}
                  name={[name, 'label']}
                  rules={[{ message: __('label is required'), required: true }]}
                >
                  <Input onChange={e => handleChange(e, name)} />
                </Form.Item>
                <Form.Item
                  {...restField}
                  className="mb-0"
                  label={__('Value')}
                  name={[name, 'value']}
                  rules={[{ message: __('value is required'), required: true }]}
                >
                  <Input />
                </Form.Item>
                <Button icon={<LuTrash2 size={14} />} onClick={() => remove(name)} type="link" />
              </div>
            ))}
            <Form.Item>
              <Button className="mt-1" icon={<LuPlus size={14} />} onClick={() => add()}>
                {__('New option')}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  )
}

export default InputSelectOption
