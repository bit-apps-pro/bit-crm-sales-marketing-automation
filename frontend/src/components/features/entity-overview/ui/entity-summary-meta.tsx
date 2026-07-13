import { formatDateTime } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import config from '@config/config'
import { date, humanTimeDiff } from '@wordpress/date'

import EntityAuditStamp from './entity-audit-stamp'
import { type EntitySummaryData } from './entity-summary-card'

export default function EntitySummaryMeta({ entity }: { entity: EntitySummaryData }) {
  const { createdAt, createdBy, updatedAt, updatedBy } = entity
  const now = date('Y-m-d H:i:s', undefined, config.TIME_ZONE)
  const formattedCreatedAt = formatDateTime(createdAt)
  const createdTimeDiff = humanTimeDiff(createdAt, now)
  const formattedUpdatedAt = updatedAt ? formatDateTime(updatedAt) : undefined
  const updatedTimeDiff = updatedAt ? humanTimeDiff(updatedAt, now) : undefined

  return (
    <div className="flex flex-col items-end gap-2">
      <EntityAuditStamp
        formattedDate={formattedCreatedAt}
        label={__('Created')}
        timeDiff={createdTimeDiff}
        user={createdBy}
      />

      <EntityAuditStamp
        formattedDate={formattedUpdatedAt!}
        label={__('Last Updated')}
        timeDiff={updatedTimeDiff!}
        user={updatedBy}
      />
    </div>
  )
}
