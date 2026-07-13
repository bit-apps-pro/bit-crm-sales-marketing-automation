import { __ } from '@common/helpers/i18nWrap'
import useDeleteTags from '@pages/tags/data/use-delete-tags'
import {
  useTagStoreKeysActions,
  useTagStoreSelectedKeys
} from '@pages/tags/state/use-selected-tag-keys-store'
import { Modal } from 'antd'
import { LuCircleAlert } from 'react-icons/lu'

import {
  useIsTrashModalOpen,
  useTagBulkOperationsStoreActions
} from '../state/use-tag-bulk-operations-store'

export default function TrashModal() {
  const isTrashModalOpen = useIsTrashModalOpen()
  const { setTrashModalOpen } = useTagBulkOperationsStoreActions()
  const selectedKeys = useTagStoreSelectedKeys()
  const { clearSelectedKeys } = useTagStoreKeysActions()
  const { deleteTags, isDeletingTags } = useDeleteTags()

  const handleBulkDeleteTags = async () => {
    const ids = selectedKeys.map(Number)
    await deleteTags({ ids })

    clearSelectedKeys()
    setTrashModalOpen(false)
  }
  return (
    <Modal
      confirmLoading={isDeletingTags}
      okText={__('Delete')}
      onCancel={() => setTrashModalOpen(false)}
      onOk={handleBulkDeleteTags}
      open={isTrashModalOpen}
      title={
        <div className="flex items-center gap-1">
          <LuCircleAlert />
          {__('Confirm Deletion')}
        </div>
      }
    >
      <p className="text-sm">{__('Are you sure you want to delete these tags?')}</p>
    </Modal>
  )
}
