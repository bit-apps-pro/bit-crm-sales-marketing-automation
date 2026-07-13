import { __ } from '@common/helpers/i18nWrap'
import { Tooltip, Typography } from 'antd'
import { LuUser } from 'react-icons/lu'

export default function NoteListActionCreatedBy({ createdBy }: { createdBy?: string }) {
  return (
    <Tooltip title={__('Created By')}>
      <div className="flex items-center gap-2">
        <LuUser className="text-gray-500" size={12} />
        <Typography.Text className="text-xs font-medium">{createdBy}</Typography.Text>
      </div>
    </Tooltip>
  )
}
