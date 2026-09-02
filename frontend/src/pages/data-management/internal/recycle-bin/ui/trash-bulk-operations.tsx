import CAPABILITIES from '@common/constants/capabilities'
import { __ } from '@common/helpers/i18nWrap'
import BulkOperationsDropdown from '@features/table/ui/bulk-operations-dropdown'
import useModal from 'antd/es/modal/useModal'
import { LuArchiveRestore, LuInfo, LuTag } from 'react-icons/lu'

import { type TrashBulkOperationsProps } from '../shared/trash-type'

export default function TrashBulkOperations({
  onDelete,
  onRestore,
  selectedIds
}: TrashBulkOperationsProps) {
  const [modal, contextHolder] = useModal()

  const showRestoreConfirm = () => {
    modal.confirm({
      cancelButtonProps: { className: 'rounded-full' },
      content: __('Restore deleted items'),
      icon: <LuInfo className="me-3 mt-0.5 shrink-0" size={18} />,
      okButtonProps: { className: 'rounded-full' },
      okText: __('Restore'),
      onOk: () => onRestore(selectedIds),
      title: __('Are you sure you want to restore the selected items?')
    })
  }

  const showDeleteConfirm = () => {
    modal.confirm({
      cancelButtonProps: { className: 'rounded-full' },
      content: __('Delete permanently'),
      icon: <LuInfo className="me-3 mt-0.5 shrink-0" size={18} />,
      okButtonProps: { className: 'rounded-full' },
      okText: __('Delete'),
      onOk: () => onDelete(selectedIds),
      title: __('Are you sure you want to delete the selected items?')
    })
  }

  const menu = [
    {
      capability: CAPABILITIES.LEAD.UPDATE,
      icon: <LuArchiveRestore size={14} />,
      key: 'restore',
      label: __('Restore'),
      onClick: showRestoreConfirm
    },
    {
      capability: CAPABILITIES.LEAD.DELETE,
      icon: <LuTag className="text-red-500" size={14} />,
      key: 'delete',
      label: __('Delete'),
      onClick: showDeleteConfirm
    }
  ]

  return (
    <>
      {contextHolder}
      <BulkOperationsDropdown ids={Object.keys(selectedIds).map(Number)} items={menu} />
    </>
  )
}
