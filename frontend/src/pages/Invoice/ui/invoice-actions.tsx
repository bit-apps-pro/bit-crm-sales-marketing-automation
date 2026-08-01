import CAPABILITIES from '@common/constants/capabilities'
import { INVOICE_STATUS } from '@common/constants/invoice-status'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import { useInvoiceBulkOperationsStoreActions } from '@pages/invoices/shared/invoice-bulk-operations/state/use-invoice-bulk-operations-store'
import TrashModal from '@pages/invoices/shared/invoice-bulk-operations/ui/trash-modal'
import { useInvoiceKeysStoreActions } from '@pages/invoices/state/use-selected-invoice-keys-store'
import { Button, Dropdown } from 'antd'
import { type MenuItemType } from 'antd/es/menu/interface'
import { LuCheck, LuChevronDown, LuDownload, LuPenLine, LuTrash2 } from 'react-icons/lu'
import { useNavigate, useParams } from 'react-router'

import DownloadPdf from '../data/download-pdf'
import useUpdateInvoiceStatus from '../data/use-update-invoice-status'

type CapableMenuItem = MenuItemType & { capability: string }

export default function InvoiceActions({ status }: { status?: string }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { updateInvoiceStatus } = useUpdateInvoiceStatus()
  const { setTrashModalOpen } = useInvoiceBulkOperationsStoreActions()
  const { setSelectedKeys } = useInvoiceKeysStoreActions()

  const handleMarkAsPaid = () => {
    if (!id) return
    updateInvoiceStatus({
      id: id,
      status: INVOICE_STATUS.PAID
    })
  }

  const handleDelete = () => {
    if (!id) return
    setSelectedKeys([id])
    setTrashModalOpen(true)
  }

  const items: CapableMenuItem[] = [
    {
      capability: CAPABILITIES.INVOICE.UPDATE,
      disabled: status === INVOICE_STATUS.PAID || status === INVOICE_STATUS.PARTIALLY_PAID,
      icon: <LuPenLine size={14} />,
      key: 'edit',
      label: <span>{__('Edit')}</span>,
      onClick: () => id && navigate(`/invoices/edit/${id}`)
    },
    {
      capability: CAPABILITIES.INVOICE.VIEW,
      icon: <LuDownload size={14} />,
      key: 'download',
      label: <DownloadPdf invoiceId={Number(id)}>{__('Download')}</DownloadPdf>
    },
    {
      capability: CAPABILITIES.INVOICE.UPDATE,
      disabled: status === INVOICE_STATUS.PAID,
      icon: <LuCheck size={14} />,
      key: 'statusUpdate',
      label: <span>{__('Mark as Paid')}</span>,
      onClick: () => handleMarkAsPaid()
    },
    {
      capability: CAPABILITIES.INVOICE.DELETE,
      icon: <LuTrash2 className="text-red-500" size={14} />,
      key: 'delete',
      label: <span className="text-red-500">{__('Delete')}</span>,
      onClick: () => handleDelete()
    }
  ]

  return (
    <>
      <Dropdown
        arrow
        menu={{
          items: items.map(item => ({
            disabled: item.disabled || !checkCapability(item.capability),
            key: item.key,
            label: (
              <div className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </div>
            ),
            onClick: item.onClick
          }))
        }}
        placement="bottomRight"
        trigger={['click']}
      >
        <Button className="flex items-center gap-1 rounded-full text-sm" type="dashed">
          {__('Actions')}
          <LuChevronDown />
        </Button>
      </Dropdown>
      <TrashModal onSuccess={() => navigate('../invoices')} />
    </>
  )
}
