import { __ } from '@common/helpers/i18nWrap'
import { Button, Popconfirm } from 'antd'
import { LuInfo, LuTrash2 } from 'react-icons/lu'

import useDeleteInvoices from '../data/use-delete-invoices'
import { useInvoiceKeysStoreActions } from '../state/use-selected-invoice-keys-store'

export default function DeleteInvoicePopup({ id }: { id: number }) {
  const { deleteInvoices } = useDeleteInvoices()
  const { clearSelectedKeys } = useInvoiceKeysStoreActions()

  const handleDeleteInvoice = async (id: number) => {
    await deleteInvoices({ ids: [id] })
    clearSelectedKeys()
  }

  return (
    <Popconfirm
      cancelText={__('No')}
      description={__('Are you sure you want to delete the invoice?')}
      icon={false}
      okText={__('Delete')}
      onConfirm={() => handleDeleteInvoice(id)}
      placement="topRight"
      title={
        <div className="flex items-center gap-1">
          <LuInfo size={18} />
          {__('Confirm Deletion')}
        </div>
      }
    >
      <Button danger icon={<LuTrash2 size={14} />} type="link" />
    </Popconfirm>
  )
}
