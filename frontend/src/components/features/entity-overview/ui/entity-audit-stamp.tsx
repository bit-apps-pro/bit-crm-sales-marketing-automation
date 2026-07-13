import { __ } from '@common/helpers/i18nWrap'
import { Tooltip } from 'antd'

interface EntityAuditStampProps {
  formattedDate: string
  label: string
  timeDiff: string
  user?: string
}

export default function EntityAuditStamp({
  formattedDate,
  label,
  timeDiff,
  user
}: EntityAuditStampProps) {
  return (
    <div className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-500">
      <span className="text-xs font-medium">{label}</span>
      {user && timeDiff ? (
        <>
          <Tooltip placement="top" title={formattedDate}>
            <span className="text-xs">{timeDiff}</span>
          </Tooltip>
          <span className="text-xs">{__('by')}</span>
          <span className="text-sm font-medium">{user}</span>
        </>
      ) : (
        <span className="text-xs">-</span>
      )}
    </div>
  )
}
