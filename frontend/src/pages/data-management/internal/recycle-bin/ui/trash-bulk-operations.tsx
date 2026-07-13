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
      content: __('Restore deleted items'),
      icon: <LuInfo size={18} />,
      okText: __('Restore'),
      onOk: () => onRestore(selectedIds),
      title: __('Are you Confirm to Restore?')
    })
  }

  const showDeleteConfirm = () => {
    modal.confirm({
      content: __('Delete permanently'),
      icon: <LuInfo size={18} />,
      okText: __('Delete'),
      onOk: () => onDelete(selectedIds),
      title: __('Are you Confirm to Delete?')
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
