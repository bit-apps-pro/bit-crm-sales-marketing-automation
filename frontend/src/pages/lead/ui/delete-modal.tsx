import { __ } from '@common/helpers/i18nWrap'
import useDeleteLeads from '@pages/leads/data/use-delete-leads'
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

  const { deleteLeads, isDeletingLeads } = useDeleteLeads()

  const handleDeleteLead = async () => {
    const { data } = await deleteLeads({ ids: [id] })
    setOpen(false)

    if (data?.previous_id || data?.next_id) {
      return navigate(`../leads/details/${data.previous_id || data.next_id}`)
    }

    return navigate('../leads')
  }

  return (
    <Modal
      confirmLoading={isDeletingLeads}
      okText={__('Delete')}
      onCancel={() => setOpen(false)}
      onOk={handleDeleteLead}
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
          {__('Are you sure you want to delete the lead? This will be moved to Trash.')}
        </p>
      </If>
    </Modal>
  )
}
