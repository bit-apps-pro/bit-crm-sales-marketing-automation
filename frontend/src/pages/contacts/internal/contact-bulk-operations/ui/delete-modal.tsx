import { __ } from '@common/helpers/i18nWrap'
import useDeleteContacts from '@pages/contacts/data/use-delete-contacts'
import {
  useContactStoreKeysActions,
  useContactStoreSelectedKeys
} from '@pages/contacts/state/use-selected-contact-keys-store'
import If from '@utilities/If'
import { Modal } from 'antd'
import { LuInfo } from 'react-icons/lu'

import useContactBulkOperationsStore from '../state/use-contact-bulk-operations-store'

export default function DeleteModal() {
  const { isDeleteModalOpen, setDeleteModalOpen } = useContactBulkOperationsStore()
  const selectedKeys = useContactStoreSelectedKeys()
  const { clearSelectedKeys } = useContactStoreKeysActions()
  const { deleteContacts, isDeletingContacts } = useDeleteContacts()

  const handleDelete = async () => {
    const ids = selectedKeys.map(Number)

    await deleteContacts({ ids })
    clearSelectedKeys()
    setDeleteModalOpen(false)
  }

  return (
    <Modal
      confirmLoading={isDeletingContacts}
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
            'Are you sure you want to delete the selected contacts? Deleted contacts will be moved to the Trash.'
          )}
        </p>
      </If>
    </Modal>
  )
}
