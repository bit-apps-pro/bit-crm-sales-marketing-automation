import { __ } from '@common/helpers/i18nWrap'
import AttachmentGallery from '@features/attachment-gallery'
import If from '@utilities/If'
import { Descriptions, Divider, Drawer, Skeleton, Typography } from 'antd'

import useEmail from '../data/use-email'
import { type Email } from '../data/use-emails'
import { MAIL_DIRECTION } from '../shared/constants'
import { type EntityModule, type FormattedEmailData } from '../shared/types'
import useEmailViewStore from '../state/use-email-view-store'

const getItems = (data: FormattedEmailData) => {
  return [
    {
      children: data?.emailDirection === MAIL_DIRECTION.SENT ? data.imapUsername : data.entityEmail,
      key: 'from',
      label: __('From')
    },
    {
      children: data?.emailDirection === MAIL_DIRECTION.SENT ? data.entityEmail : data.imapUsername,
      key: 'to',
      label: __('To')
    },
    {
      children: data.emailDate,
      key: 'date',
      label: __('Date')
    },
    {
      children: data.subject,
      key: 'subject',
      label: __('Subject')
    }
  ]
}

export default function EmailView({ module }: { module: EntityModule }) {
  const { currentEmailData, handleViewClose, isViewOpen } = useEmailViewStore()
  const { email, isEmailFetching, isRefetchingEmail } = useEmail<Email>(
    currentEmailData?.id || 0,
    module
  )

  return (
    <Drawer
      destroyOnHidden
      onClose={handleViewClose}
      open={isViewOpen && currentEmailData !== undefined}
      title={currentEmailData?.subject}
      width={720}
    >
      <If conditions={isViewOpen && currentEmailData !== undefined}>
        <div className="flex flex-col">
          <Descriptions
            // eslint-disable-next-line translate-obj-prop/translate-obj-prop
            classNames={{ label: 'min-w-16' }}
            column={1}
            items={currentEmailData ? getItems(currentEmailData) : []}
            size="small"
          />
          <Divider />

          {isEmailFetching || isRefetchingEmail ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <div
              className="max-w-full overflow-x-auto break-words [&_*]:max-w-full"
              dangerouslySetInnerHTML={{ __html: email?.body || '' }}
            />
          )}
          <If conditions={email?.attachments && email.attachments.length > 0}>
            <div>
              <Divider />
              <Typography.Text strong>
                {email?.attachments?.length} {__('Attachment(s)')}
              </Typography.Text>
              <AttachmentGallery attachments={email?.attachments || []} />
            </div>
          </If>
        </div>
      </If>
    </Drawer>
  )
}
