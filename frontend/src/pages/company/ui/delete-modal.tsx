import { __ } from '@common/helpers/i18nWrap'
import useDeleteCompanies from '@pages/companies/internal/company-bulk-operations/data/use-delete-companies'
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

  const { deleteCompanies, isDeletingCompanies } = useDeleteCompanies()

  const handleDelete = async () => {
    const { data } = await deleteCompanies({ ids: [id] })
    setOpen(false)

    if (data?.previous_id || data?.next_id) {
      return navigate(`../companies/details/${data?.previous_id || data?.next_id}`)
    }

    return navigate('../companies')
  }

  return (
    <Modal
      confirmLoading={isDeletingCompanies}
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
          {__('Are you sure you want to delete the company? This will be moved to Trash.')}
        </p>
      </If>
    </Modal>
  )
}
