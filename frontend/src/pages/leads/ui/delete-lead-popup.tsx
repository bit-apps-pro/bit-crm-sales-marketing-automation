import { __ } from '@common/helpers/i18nWrap'
import { Button, Popconfirm } from 'antd'
import { LuInfo, LuTrash2 } from 'react-icons/lu'

import useDeleteLeads from '../data/use-delete-leads'

export default function DeleteLeadPopup({ id }: { id: number }) {
  const { deleteLeads } = useDeleteLeads()

  const handleDelete = async (id: number) => {
    await deleteLeads({ ids: [id] })
  }

  return (
    <Popconfirm
      cancelText={__('No')}
      description={__('Are you sure you want to delete the lead?')}
      icon={false}
      okText={__('Delete')}
      onConfirm={() => handleDelete(id)}
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
