import { slugify } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import customizedRequiredMark from '@utilities/customized-required-mark'
import If from '@utilities/If'
import { ColorPicker, Form, Input, InputNumber, Modal, Select } from 'antd'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

import useSaveStage from '../data/use-save-stage'
import { CATEGORY_OPTIONS, CUSTOM_STAGE_PREFIX } from '../shared/constants'
import useStageStore from '../state/use-stage-store'

export default function StageCreateModal() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { handleModal, isCreateModalOpen, setCreateModalOpen } = useStageStore()
  const [form] = Form.useForm()
  const { isSavingStage, saveStage } = useSaveStage(form)

  const handleClose = () => {
    setCreateModalOpen(false)
    handleModal('close', setSearchParams)
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const key = CUSTOM_STAGE_PREFIX + slugify(values.name, '_')
      await saveStage({ ...values, key })
      setCreateModalOpen(false)
      handleModal('close', setSearchParams)
      form.resetFields()
    } catch (error) {
      console.error('Failed to create stage:', error)
    }
  }

  useEffect(() => {
    if (searchParams.get('modal') === 'stage_create') {
      setCreateModalOpen(true)
      return
    }

    setCreateModalOpen(false)
  }, [searchParams, setCreateModalOpen])

  return (
    <Modal
      cancelButtonProps={{ className: 'rounded-full' }}
      centered
      confirmLoading={isSavingStage}
      destroyOnHidden
      okButtonProps={{ className: 'rounded-full', disabled: isSavingStage }}
      okText={__('Create')}
      onCancel={handleClose}
      onOk={handleSubmit}
      open={isCreateModalOpen}
      styles={{
        body: {
          marginInline: '-22px',
          maxHeight: '70vh',
          overflowY: 'auto',
          paddingInline: '22px'
        }
      }}
      title={__('Create Stage')}
    >
      <If conditions={isCreateModalOpen}>
        <Form
          form={form}
          initialValues={{ color: '' }}
          layout="vertical"
          requiredMark={customizedRequiredMark}
        >
          <Form.Item
            label={__('Stage Name')}
            name="name"
            rules={[{ message: __('Please input the stage name!'), required: true }]}
          >
            <Input placeholder={__('Enter stage name')} />
          </Form.Item>

          <Form.Item
            label={__('Probability (%)')}
            name="probability"
            rules={[
              { message: __('Please input the probability!'), required: true },
              {
                max: 100,
                message: __('Probability must be a number between 0 and 100'),
                min: 0,
                type: 'number'
              }
            ]}
          >
            <InputNumber className="w-full" max={100} min={0} placeholder={__('Enter probability')} />
          </Form.Item>
          <Form.Item
            label={__('Deal Category')}
            name="deal_category"
            rules={[{ message: __('Please select the deal category!'), required: true }]}
          >
            <Select options={CATEGORY_OPTIONS} />
          </Form.Item>
          <Form.Item
            label={__('Color')}
            name="color"
            normalize={value => {
              if (typeof value === 'string') return value
              if (value && typeof value === 'object' && 'toHexString' in value) {
                return value.toHexString()
              }
              return value
            }}
          >
            <ColorPicker allowClear className="w-full" format="hex" showText size="large" />
          </Form.Item>
        </Form>
      </If>
    </Modal>
  )
}
