import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Card, Tag, Typography } from 'antd'

import ImapItemDropdown from '../internal/imap-item-dropdown'
import ImapItemStatusSwitch from '../internal/imap-item-status-switch'
import { type ImapDataType } from '../shared/imap-type'

export default function ImapItem({ imap }: { imap: ImapDataType }) {
  return (
    <Card className="w-64" data-testid="imapItem" size="small">
      <div className="mb-1 flex min-h-8 items-center justify-between">
        <Typography.Text className="font-semibold capitalize" ellipsis={{ tooltip: true }}>
          {imap.title}
        </Typography.Text>
        <If conditions={Number(imap.can_update)}>
          <div className="flex items-center">
            <ImapItemDropdown id={imap.id || 0} />
            <ImapItemStatusSwitch id={imap.id || 0} status={imap.status} />
          </div>
        </If>
      </div>
      <span>{imap.username}</span>
      <div className="mt-1">
        <Tag className="capitalize" color="blue">
          {imap.platform === 'other' ? __('Custom') : imap.platform}
        </Tag>
        <Tag color={imap.visibility === 'public' ? 'green' : 'red'}>
          {imap.visibility === 'public' ? __('Shared') : __('Private')}
        </Tag>
      </div>
    </Card>
  )
}
