import { __ } from '@common/helpers/i18nWrap'
import { Tooltip, Typography } from 'antd'
import { LuCalendar } from 'react-icons/lu'

export default function NoteListActionDate({ date }: { date?: string }) {
  return (
    <Tooltip title={__('Creation Date')}>
      <div className="flex items-center gap-2">
        <LuCalendar className="text-gray-500" size={12} />
        <Typography.Text className="text-xs font-medium" type="secondary">
          {date || '-'}
        </Typography.Text>
      </div>
    </Tooltip>
  )
}
