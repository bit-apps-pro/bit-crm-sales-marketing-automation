import CAPABILITIES from '@common/constants/capabilities'
import { __ } from '@common/helpers/i18nWrap'
import { useTagStoreSelectedKeys } from '@pages/tags/state/use-selected-tag-keys-store'
import If from '@utilities/If'
import { Button } from 'antd'
import { LuTrash2 } from 'react-icons/lu'

import { useTagBulkOperationsStoreActions } from '../state/use-tag-bulk-operations-store'
import TrashModal from './trash-modal'

export default function TagsBulkOperations() {
  const selectedKeys = useTagStoreSelectedKeys()
  const { setTrashModalOpen } = useTagBulkOperationsStoreActions()
  return (
    <>
      <If conditions={selectedKeys.length > 0 && CAPABILITIES.TAG.DELETE}>
        <Button
          className="rounded-full"
          danger
          icon={<LuTrash2 />}
          onClick={() => setTrashModalOpen(true)}
          size="large"
        >
          {selectedKeys.length === 1 ? __('Delete Tag') : __('Delete Tags')}
          <span>({selectedKeys.length})</span>
        </Button>
      </If>
      <TrashModal />
    </>
  )
}
