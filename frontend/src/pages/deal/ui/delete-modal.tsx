import { __ } from '@common/helpers/i18nWrap'
import useDeleteDeals from '@pages/deals/internal/deal-bulk-operations/data/use-delete-deals'
import If from '@utilities/If'
import { Modal } from 'antd'
import { LuInfo } from 'react-icons/lu'
import { useNavigate } from 'react-router'

export default function DeleteModal({
  id,
  open,
  setOpen
}: {
  id: number | string
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const navigate = useNavigate()

  const { deleteDeals, isDeletingDeals } = useDeleteDeals()

  const handleDelete = async () => {
    const { data } = await deleteDeals({ ids: [id] })
    setOpen(false)

    if (data?.previous_id || data?.next_id) {
      return navigate(`../deals/details/${data?.previous_id || data?.next_id}`)
    }

    return navigate('../deals')
  }

  return (
    <Modal
      confirmLoading={isDeletingDeals}
      destroyOnHidden
      okText={__('Delete')}
      onCancel={() => setOpen(false)}
      onOk={handleDelete}
      open={open}
      title={
        <div className="flex items-center gap-1">
          <LuInfo size={18} />
          {__('Confirm Deletion')}
        </div>
      }
    >
      <If conditions={open}>
        <p className="text-sm">
          {__('Are you sure you want to delete the deal? This will be moved to Trash.')}
        </p>
      </If>
    </Modal>
  )
}
