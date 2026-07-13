import { MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import useTags from '@common/hooks/use-tags'
import If from '@utilities/If'
import { Form, Modal, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'

import useDeleteTagEntities from '../data/use-delete-tag-entities'
import useSaveTagEntities from '../data/use-save-tag-entities'
import useBulkOperationsStore from '../state/use-bulk-operations-store'

export default function TagsModal() {
  const [form] = useForm<{ tags: number[] }>()
  const { isTagEntityStoring, storeTagEntity } = useSaveTagEntities(form)
  const { deleteTagEntity, isTagEntityDeleting } = useDeleteTagEntities(form)
  const { isTagsFetching, isTagsPending, tags } = useTags({
    module: MODULES.COMPANY
  })

  const {
    isAttachTagsModalOpen,
    isDetachTagsModalOpen,
    setAttachTagsModalOpen,
    setDetachTagsModalOpen
  } = useBulkOperationsStore()

  const handleAttachTags = async () => {
    const values = await form.validateFields()

    await storeTagEntity(values?.tags)

    form.resetFields()
    setAttachTagsModalOpen(false)
  }

  const handleDetachTags = async () => {
    const values = await form.validateFields()

    await deleteTagEntity(values?.tags)

    form.resetFields()
    setDetachTagsModalOpen(false)
  }

  const handleCancel = () => {
    form.resetFields()
    setAttachTagsModalOpen(false)
    setDetachTagsModalOpen(false)
  }

  return (
    <Modal
      confirmLoading={isTagEntityStoring || isTagEntityDeleting}
      destroyOnHidden
      okText={isAttachTagsModalOpen ? __('Add') : __('Remove')}
      onCancel={handleCancel}
      onOk={isAttachTagsModalOpen ? handleAttachTags : handleDetachTags}
      open={isAttachTagsModalOpen || isDetachTagsModalOpen}
      title={isAttachTagsModalOpen ? __('Add Tag') : __('Remove Tag')}
    >
      <If conditions={isAttachTagsModalOpen || isDetachTagsModalOpen}>
        <div className="mt-4">
          <Form className="pt-2" form={form} layout="vertical">
            <Form.Item
              label={__('Tags')}
              name="tags"
              rules={[
                {
                  message: __('Select at least one tag!'),
                  required: true
                }
              ]}
            >
              <Select
                loading={isTagsFetching || isTagsPending}
                mode="multiple"
                options={tags?.map(tag => ({ label: tag.title, value: tag.id }))}
              />
            </Form.Item>
          </Form>
        </div>
      </If>
    </Modal>
  )
}
