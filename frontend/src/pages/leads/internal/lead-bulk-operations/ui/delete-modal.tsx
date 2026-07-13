import { __ } from '@common/helpers/i18nWrap'
import useDeleteLeads from '@pages/leads/data/use-delete-leads'
import {
  useLeadStoreKeysActions,
  useLeadStoreSelectedKeys
} from '@pages/leads/state/use-selected-lead-keys-store'
import If from '@utilities/If'
import { Modal } from 'antd'
import { LuInfo } from 'react-icons/lu'

import useLeadBulkOperationsStore from '../state/use-lead-bulk-operations-store'

export default function DeleteModal() {
  const { isDeleteModalOpen, setDeleteModalOpen } = useLeadBulkOperationsStore()
  const selectedLeadKeys = useLeadStoreSelectedKeys()
  const { setSelectedKeys } = useLeadStoreKeysActions()

  const { deleteLeads, isDeletingLeads } = useDeleteLeads()

  const handleDelete = async () => {
    await deleteLeads({ ids: selectedLeadKeys })

    setSelectedKeys([])
    setDeleteModalOpen(false)
  }

  return (
    <Modal
      confirmLoading={isDeletingLeads}
      okText={__('Delete')}
      onCancel={() => setDeleteModalOpen(false)}
      onOk={handleDelete}
      open={isDeleteModalOpen}
      title={
        <div className="flex items-center gap-1">
          <LuInfo size={18} />
          {__('Confirm Deletion')}
        </div>
      }
    >
      <If conditions={isDeleteModalOpen}>
        <p className="text-sm">
          {__(
            'Are you sure you want to delete the selected leads? Deleted leads will be moved to the Trash.'
          )}
        </p>
      </If>
    </Modal>
  )
}
