import { __, sprintf } from '@common/helpers/i18nWrap'
import { Button, Popconfirm } from 'antd'
import { LuX } from 'react-icons/lu'

import useDetachRelatedEntities from '../data/use-detach-related-entities'

interface DetachModulePopupProps {
  entity: string
  entityId: number
  relatedEntity: string
  relatedEntityIds: number[]
}

export default function DetachRelatedEntitiesPopup({
  entity,
  entityId,
  relatedEntity,
  relatedEntityIds
}: DetachModulePopupProps) {
  const { detachRelatedEntities } = useDetachRelatedEntities()

  const handleDetach = async () => {
    await detachRelatedEntities({ entity, entityId, relatedEntity, relatedEntityIds })
  }

  return (
    <Popconfirm
      cancelText={__('No')}
      description={sprintf(__('Are you sure you want to detach the %s?', 'bit-crm-sales-marketing-automation'), relatedEntity)}
      okText={__('Yes')}
      onConfirm={handleDetach}
      placement="topRight"
      title={__('Confirm Detach')}
    >
      <Button aria-label={__('Detach company')} danger icon={<LuX size={14} />} type="link" />
    </Popconfirm>
  )
}
