import { __ } from '@common/helpers/i18nWrap'
import { useSelectedKeys } from '@pages/invoices/state/use-selected-invoice-keys-store'
import { Button } from 'antd'
import { LuTrash2 } from 'react-icons/lu'

import { useInvoiceBulkOperationsStoreActions } from '../state/use-invoice-bulk-operations-store'
import TrashModal from './trash-modal'

interface InvoiceBulkOperationsProps {
  size?: 'large' | 'middle' | 'small'
}

export default function InvoiceBulkOperations({ size = 'large' }: InvoiceBulkOperationsProps) {
  const selectedKeys = useSelectedKeys()
  const { setTrashModalOpen } = useInvoiceBulkOperationsStoreActions()
  return (
    <div>
      <Button
        className="rounded-full text-sm"
        danger
        icon={<LuTrash2 className="text-red-500" size={14} />}
        onClick={() => setTrashModalOpen(true)}
        size={size}
      >
        {selectedKeys.length === 1 ? __('Delete Invoice') : __('Delete Invoices')}
        <span>({selectedKeys.length})</span>
      </Button>
      <TrashModal />
    </div>
  )
}
