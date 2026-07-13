import { __ } from '@common/helpers/i18nWrap'
import { useSelectedKeys } from '@pages/invoices/state/use-selected-invoice-keys-store'
import { Button } from 'antd'
import { LuTrash2 } from 'react-icons/lu'

import { useInvoiceBulkOperationsStoreActions } from '../state/use-invoice-bulk-operations-store'
import TrashModal from './trash-modal'

export default function InvoiceBulkOperations() {
  const selectedKeys = useSelectedKeys()
  const { setTrashModalOpen } = useInvoiceBulkOperationsStoreActions()
  return (
    <div>
      <Button
        className="rounded-full text-sm"
        icon={<LuTrash2 className="text-red-500" size={14} />}
        onClick={() => setTrashModalOpen(true)}
        size="large"
      >
        {selectedKeys.length === 1 ? __('Delete Invoice') : __('Delete Invoices')}
        <span>({selectedKeys.length})</span>
      </Button>
      <TrashModal />
    </div>
  )
}
