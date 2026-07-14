import { __, sprintf } from '@common/helpers/i18nWrap'
import { Modal } from 'antd'
import { LuInfo } from 'react-icons/lu'

import useDetachRelatedEntities from '../data/use-detach-related-entities'
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
  const { detachRelatedEntities, isDetachingRelatedEntities } = useDetachRelatedEntities()
  const { setDetachModalOpen } = useRelatedEntityBulkOperationsStoreActions()
  const isOpen = useRelatedEntityIsDetachModalOpen()
  const selectedKeys = useSelectedKeys()
  const { clearSelectedKeys } = useRelatedEntityKeysStoreActions()

  const handleDetachRelated = async (): Promise<void> => {
    const entityIds = selectedKeys.map(Number)
    await detachRelatedEntities({
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
      confirmLoading={isDetachingRelatedEntities}
      destroyOnHidden
      okText={__('Detach')}
      onCancel={() => setDetachModalOpen(false)}
      onOk={handleDetachRelated}
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
