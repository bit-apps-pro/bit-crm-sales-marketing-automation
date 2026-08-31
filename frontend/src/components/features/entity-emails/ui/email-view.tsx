import { drawerPlacement } from '@common/helpers/direction'
import { __ } from '@common/helpers/i18nWrap'
import AttachmentGallery from '@features/attachment-gallery'
import If from '@utilities/If'
import { Button, Descriptions, Divider, Drawer, Skeleton, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { LuReply } from 'react-icons/lu'

import useEmail from '../data/use-email'
import { type Email } from '../data/use-emails'
import { MAIL_DIRECTION } from '../shared/constants'
import { splitQuotedBody } from '../shared/split-quoted-body'
import { type EntityModule, type FormattedEmailData } from '../shared/types'
import useEmailComposeStore from '../state/use-email-compose-store'
import useEmailViewStore from '../state/use-email-view-store'

/*
 * Prefer the stored headers. A header can be missing (rows synced before the
 * columns existed, or a mail without that header), and then only that side
 * falls back to the old guess based on direction.
 */
const getFromAndTo = (data: FormattedEmailData) => {
  let guessedFrom = data.entityEmail
  let guessedTo = data.imapUsername

  if (data.emailDirection === MAIL_DIRECTION.SENT) {
    guessedFrom = data.imapUsername
    guessedTo = data.entityEmail
  }

  return {
    from: data.fromEmail || guessedFrom,
    to: data.toEmails.join(', ') || guessedTo
  }
}

const getItems = (data: FormattedEmailData) => {
  const { from, to } = getFromAndTo(data)

  const items = [
    {
      children: from,
      key: 'from',
      label: __('From')
    },
    {
      children: to,
      key: 'to',
      label: __('To')
    }
  ]

  if (data.cc.length) {
    items.push({
      children: data.cc.join(', '),
      key: 'cc',
      label: __('Cc')
    })
  }

  if (data.bcc.length) {
    items.push({
      children: data.bcc.join(', '),
      key: 'bcc',
      label: __('Bcc')
    })
  }

  items.push(
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
  )

  return items
}

export default function EmailView({ module }: { module: EntityModule }) {
  const { currentEmailData, handleViewClose, isViewOpen } = useEmailViewStore()
  const { handleComposeOpen } = useEmailComposeStore()
  const { email, isEmailFetching, isRefetchingEmail } = useEmail<Email>(
    currentEmailData?.id || 0,
    module
  )

  const [isQuotedOpen, setIsQuotedOpen] = useState(false)
  const { main, quoted } = useMemo(() => splitQuotedBody(email?.body || ''), [email?.body])

  useEffect(() => {
    setIsQuotedOpen(false)
  }, [email?.id])

  const handleReply = () => {
    if (!currentEmailData) return

    handleViewClose()
    handleComposeOpen({ id: currentEmailData.id, subject: currentEmailData.subject })
  }

  return (
    <Drawer
      destroyOnHidden
      extra={
        <Button
          className="rounded-full"
          icon={<LuReply size={14} />}
          onClick={handleReply}
          type="primary"
        >
          {__('Reply')}
        </Button>
      }
      onClose={handleViewClose}
      open={isViewOpen && currentEmailData !== undefined}
      placement={drawerPlacement}
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
            <div className="flex flex-col items-start gap-2">
              <div
                className="max-w-full overflow-x-auto break-words [&_*]:max-w-full"
                dangerouslySetInnerHTML={{ __html: main }}
              />
              <If conditions={quoted !== ''}>
                <Button
                  className="h-4 rounded-full px-2 leading-none tracking-widest"
                  onClick={() => setIsQuotedOpen(open => !open)}
                  size="small"
                  title={isQuotedOpen ? __('Hide quoted text') : __('Show quoted text')}
                  type="default"
                >
                  •••
                </Button>
                <If conditions={isQuotedOpen}>
                  <div
                    className="max-w-full overflow-x-auto break-words [&_*]:max-w-full"
                    dangerouslySetInnerHTML={{ __html: quoted }}
                  />
                </If>
              </If>
            </div>
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
