import { __ } from '@common/helpers/i18nWrap'
import {
  useCompanyKeysStoreActions,
  useSelectedKeys
} from '@pages/companies/state/use-selected-company-keys-store'
import If from '@utilities/If'
import { Modal } from 'antd'
import { LuInfo } from 'react-icons/lu'

import useDeleteCompanies from '../data/use-delete-companies'
import useBulkOperationsStore from '../state/use-bulk-operations-store'

export default function DeleteModal() {
  const selectedKeys = useSelectedKeys()

  const { clearSelectedKeys } = useCompanyKeysStoreActions()
  const { isDeleteModalOpen, setDeleteModalOpen } = useBulkOperationsStore()
  const { deleteCompanies, isDeletingCompanies } = useDeleteCompanies()

  const handleDelete = async () => {
    const ids = selectedKeys.map(Number)
    await deleteCompanies({ ids })

    clearSelectedKeys()
    setDeleteModalOpen(false)
  }

  return (
    <Modal
      confirmLoading={isDeletingCompanies}
      okText={__('Delete')}
      onCancel={() => setDeleteModalOpen(false)}
      onOk={() => handleDelete()}
      open={isDeleteModalOpen}
      title={
        <div className="flex items-center gap-1">
          <LuInfo size={18} />
          {__('Confirm Deletion')}
        </div>
      }
    >
      <If conditions={isDeleteModalOpen}>
        <p className="text-sm">
          {__(
            'Are you sure you want to delete the selected companies? Deleted companies will be moved to the Trash.'
          )}
        </p>
      </If>
    </Modal>
  )
}
