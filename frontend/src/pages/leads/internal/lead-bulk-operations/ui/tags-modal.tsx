import { MODULES } from '@common/constants/modules'
import { __ } from '@common/helpers/i18nWrap'
import useTags from '@common/hooks/use-tags'
import {
  useLeadStoreKeysActions,
  useLeadStoreSelectedKeys
} from '@pages/leads/state/use-selected-lead-keys-store'
import If from '@utilities/If'
import { Form, Modal, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useMemo } from 'react'

import useDeleteTagEntity from '../data/use-delete-tag-entity'
import useStoreTagEntity from '../data/use-store-tag-entity'
import useLeadBulkOperationsStore from '../state/use-lead-bulk-operations-store'

export default function TagsModal() {
  const [form] = useForm<{ tags: number[] }>()
  const { isTagEntityStoring, storeTagEntity } = useStoreTagEntity(form)
  const { deleteTagEntity, isTagEntityDeleting } = useDeleteTagEntity(form)
  const { isTagsFetching, isTagsPending, tags } = useTags({
    module: MODULES.LEAD
  })
  const selectedLeadKeys = useLeadStoreSelectedKeys()
  const { clearSelectedKeys } = useLeadStoreKeysActions()
  const { isAddTagModalOpen, isRemoveTagModalOpen, setAddTagModalOpen, setRemoveTagModalOpen } =
    useLeadBulkOperationsStore()

  const options = useMemo(() => tags?.map(tag => ({ label: tag.title, value: tag.id })), [tags])

  const handleAttachTags = async () => {
    const values = await form.validateFields()
    const ids = selectedLeadKeys.map(Number)

    const tagEntityData = {
      lead_ids: ids,
      tag_ids: values?.tags
    }

    await storeTagEntity(tagEntityData)

    setAddTagModalOpen(false)
    clearSelectedKeys()
  }

  const handleDetachTags = async () => {
    const values = await form.validateFields()
    const ids = selectedLeadKeys.map(Number)

    const tagEntityData = {
      lead_ids: ids,
      tag_ids: values?.tags
    }

    await deleteTagEntity(tagEntityData)

    setRemoveTagModalOpen(false)
    clearSelectedKeys()
  }

  const handleCancel = () => {
    form.resetFields()
    setAddTagModalOpen(false)
    setRemoveTagModalOpen(false)
  }

  return (
    <Modal
      confirmLoading={isTagEntityStoring || isTagEntityDeleting}
      destroyOnHidden
      okText={isAddTagModalOpen ? __('Add') : __('Remove')}
      onCancel={handleCancel}
      onOk={isAddTagModalOpen ? handleAttachTags : handleDetachTags}
      open={isAddTagModalOpen || isRemoveTagModalOpen}
      title={isAddTagModalOpen ? __('Add Tag') : __('Remove Tag')}
    >
      <If conditions={isAddTagModalOpen || isRemoveTagModalOpen}>
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
              <Select loading={isTagsFetching || isTagsPending} mode="multiple" options={options} />
            </Form.Item>
          </Form>
        </div>
      </If>
    </Modal>
  )
}
