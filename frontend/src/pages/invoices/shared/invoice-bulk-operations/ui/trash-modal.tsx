import { __ } from '@common/helpers/i18nWrap'
import useDeleteInvoices from '@pages/invoices/data/use-delete-invoices'
import {
  useInvoiceKeysStoreActions,
  useSelectedKeys
} from '@pages/invoices/state/use-selected-invoice-keys-store'
import { Modal } from 'antd'
import { LuInfo } from 'react-icons/lu'

import {
  useInvoiceBulkOperationsStoreActions,
  useIsTrashModalOpen
} from '../state/use-invoice-bulk-operations-store'

export default function TrashModal({ onSuccess }: { onSuccess?: () => void }) {
  const isTrashModalOpen = useIsTrashModalOpen()
  const { setTrashModalOpen } = useInvoiceBulkOperationsStoreActions()
  const { clearSelectedKeys } = useInvoiceKeysStoreActions()
  const selectedKeys = useSelectedKeys()
  const { deleteInvoices, isDeletingInvoices } = useDeleteInvoices()

  const handleInvoicesDelete = async () => {
    const ids = selectedKeys.map(Number)
    await deleteInvoices({ ids })

    clearSelectedKeys()
    setTrashModalOpen(false)
    onSuccess?.()
  }

  const handleCancel = () => {
    setTrashModalOpen(false)
    clearSelectedKeys()
  }

  return (
    <Modal
      confirmLoading={isDeletingInvoices}
      okText={__('Delete')}
      onCancel={() => handleCancel()}
      onOk={handleInvoicesDelete}
      open={isTrashModalOpen}
      title={
        <div className="flex items-center gap-1">
          <LuInfo size={18} />
          {__('Confirm Deletion')}
        </div>
      }
    >
      <p className="text-sm">
        {__(
          'Are you sure you want to delete the selected invoices? Deleted invoices will be moved to the Trash.'
        )}
      </p>
    </Modal>
  )
}
