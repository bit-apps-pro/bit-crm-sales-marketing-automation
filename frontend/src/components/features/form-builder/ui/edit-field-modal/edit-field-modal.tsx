import NotifyContext from '@common/context/NotifyContext'
import { __ } from '@common/helpers/i18nWrap'
import customizedRequiredMark from '@utilities/customized-required-mark'
import If from '@utilities/If'
import InputSelectOption from '@utilities/input-select-option/input-select-option'
import { Button, Form, Input, Modal, Tooltip } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useContext, useEffect, useState } from 'react'
import { LuPenLine } from 'react-icons/lu'

import useUpdateFieldSettings from '../../data/use-update-field-settings'
import { type EditFieldModalPropsType } from '../../shared/field-types'

export default function EditFieldModal({ item, module }: EditFieldModalPropsType) {
  const { type } = item
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = useForm()
  const { messageApi } = useContext(NotifyContext)
  const { isUpdateFieldSettingsPending, updateFieldSettings } = useUpdateFieldSettings(module, form)

  const handleModal = (open: boolean) => () => {
    setIsModalOpen(open)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()

    if (
      (type === 'select' || type === 'multi-select' || type === 'radio' || type === 'checkbox') &&
      !values.options?.length
    ) {
      messageApi?.error(__('Add at least one option'))
      return
    }

    await updateFieldSettings({ [item.field_key]: values })
    setIsModalOpen(false)
    form.resetFields()
  }

  useEffect(() => {
    if (isModalOpen) {
      form.setFieldsValue(item)
    }
  }, [isModalOpen, item, form])

  return (
    <>
      <Tooltip destroyOnHidden mouseEnterDelay={0.5} placement="bottom" title={__('Edit')}>
        <Button
          aria-label={__('Edit field')}
          icon={<LuPenLine size={14} strokeWidth={2} />}
          onClick={handleModal(true)}
          shape="circle"
          size="middle"
          type="link"
        />
      </Tooltip>

      <Modal
        confirmLoading={isUpdateFieldSettingsPending}
        okText={__('Update')}
        onCancel={handleModal(false)}
        onOk={handleSubmit}
        open={isModalOpen}
        title={__('Edit Field')}
      >
        <div className="mt-4">
          <Form
            className="space-y-2"
            form={form}
            layout="vertical"
            requiredMark={customizedRequiredMark}
          >
            <If conditions={type === 'section'}>
              <Form.Item
                className="mb-0"
                label={__('Label')}
                name="label"
                required
                rules={[{ message: __('Label is required'), required: true }]}
              >
                <Input />
              </Form.Item>
            </If>

            <If
              conditions={
                type === 'select' || type === 'multi-select' || type === 'radio' || type === 'checkbox'
              }
            >
              <InputSelectOption form={form} />
            </If>
          </Form>
        </div>
      </Modal>
    </>
  )
}
