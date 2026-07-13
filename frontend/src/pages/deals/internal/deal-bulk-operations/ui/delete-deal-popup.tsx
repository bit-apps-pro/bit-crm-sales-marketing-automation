import { __ } from '@common/helpers/i18nWrap'
import { Button, Popconfirm } from 'antd'
import { LuInfo, LuTrash2 } from 'react-icons/lu'

import useDeleteDeals from '../data/use-delete-deals'

export default function DeleteDealPopup({ id }: { id: number }) {
  const { deleteDeals } = useDeleteDeals()

  const handleDelete = async (id: number) => {
    await deleteDeals({ ids: [id] })
  }

  return (
    <Popconfirm
      cancelText={__('No')}
      description={__('Are you sure you want to delete the deal?')}
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
