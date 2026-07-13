import { __, sprintf } from '@common/helpers/i18nWrap'
import { Modal } from 'antd'
import { LuInfo } from 'react-icons/lu'

import useDetachModule from '../data/use-detach-related-entities'
import {
  useRelatedEntityBulkOperationsStoreActions,
  useRelatedEntityIsDetachModalOpen
} from '../state/use-related-entity-bulk-operations-store'
import {
  useRelatedEntityKeysStoreActions,
  useSelectedKeys
} from '../state/use-selected-related-entity-keys-store'

interface DetachRelatedModalProps {
  entity: string
  entityId: number
  relatedEntity: string
}

export default function DetachRelatedModal({
  entity,
  entityId,
  relatedEntity
}: DetachRelatedModalProps) {
  const { detachModule, isDetachingModule } = useDetachModule()
  const { setDetachModalOpen } = useRelatedEntityBulkOperationsStoreActions()
  const isOpen = useRelatedEntityIsDetachModalOpen()
  const selectedKeys = useSelectedKeys()
  const { clearSelectedKeys } = useRelatedEntityKeysStoreActions()

  const handleDetachModule = async (): Promise<void> => {
    const entityIds = selectedKeys.map(Number)
    await detachModule({
      entity,
      entityId,
      relatedEntity,
      relatedEntityIds: entityIds
    })
    setDetachModalOpen(false)
    clearSelectedKeys()
  }
  return (
    <Modal
      confirmLoading={isDetachingModule}
      destroyOnHidden
      okText={__('Detach')}
      onCancel={() => setDetachModalOpen(false)}
      onOk={handleDetachModule}
      open={isOpen}
      title={
        <div className="flex items-center gap-1">
          <LuInfo size={18} />
          {__('Confirm Detach')}
        </div>
      }
    >
      <p>
        {sprintf(
          __('This action will detach the selected %s.', 'bit-crm'),
          selectedKeys.length > 1 ? `${relatedEntity}s` : relatedEntity
        )}
      </p>
    </Modal>
  )
}
