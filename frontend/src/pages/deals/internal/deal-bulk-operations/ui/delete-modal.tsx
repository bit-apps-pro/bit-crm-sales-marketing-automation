import { ExclamationCircleOutlined } from '@ant-design/icons'
import { __ } from '@common/helpers/i18nWrap'
import {
  useSelectedKeysActionsStore,
  useSelectedKeysStore
} from '@pages/deals/state/use-selected-deal-keys-store'
import If from '@utilities/If'
import { Modal } from 'antd'
import { LuX } from 'react-icons/lu'

import useDeleteDeals from '../data/use-delete-deals'
import {
  useBulkOperationActionsStore,
  useIsDeleteModalOpenStore
} from '../state/use-bulk-operations-store'

export default function DeleteModal() {
  const { clearSelectedKeys } = useSelectedKeysActionsStore()
  const selectedKeys = useSelectedKeysStore()
  const isDeleteModalOpen = useIsDeleteModalOpenStore()
  const { setDeleteModalOpen } = useBulkOperationActionsStore()

  const { deleteDeals, isDeletingDeals } = useDeleteDeals()

  const handleDealsDelete = async () => {
    const ids = selectedKeys.map(Number)
    await deleteDeals({ ids })

    clearSelectedKeys()
    setDeleteModalOpen(false)
  }

  return (
    <Modal
      closeIcon={<LuX />}
      confirmLoading={isDeletingDeals}
      destroyOnHidden
      okText={__('Delete')}
      onCancel={() => setDeleteModalOpen(false)}
      onOk={() => handleDealsDelete()}
      open={isDeleteModalOpen}
      title={
        <div className="flex items-center gap-1">
          <ExclamationCircleOutlined />
          {__('Confirm Deletion')}
        </div>
      }
    >
      <If conditions={isDeleteModalOpen}>
        <p className="text-sm">
          {__(
            'Are you sure you want to permanently delete the selected deals? This action cannot be undone.'
          )}
        </p>
      </If>
    </Modal>
  )
}
