import { LoadingOutlined } from '@ant-design/icons'
import CAPABILITIES from '@common/constants/capabilities'
import NotifyContext from '@common/context/NotifyContext'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { cn, formatDateTime } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import { type Response } from '@common/helpers/request'
import useDebounceState from '@common/hooks/useDebounceState'
import config from '@config/config'
import { type FieldItem } from '@features/field-settings/shared/field-types'
import If from '@utilities/If'
import Pagination from '@utilities/pagination'
import SearchInput from '@utilities/search-input'
import { Alert, Button, Select, Typography } from 'antd'
import { useContext, useEffect, useMemo, useState } from 'react'
import { LuPenLine, LuRefreshCcw } from 'react-icons/lu'
import { useSearchParams } from 'react-router'

import useAutoSyncImap from './data/use-auto-sync-imap'
import useEmails, { type Email } from './data/use-emails'
import useImapSettings, { type Imap } from './data/use-imap-settings'
import useSyncImap from './data/use-sync-imap'
import { MAIL_DIRECTION } from './shared/constants'
import { type EntityModule } from './shared/types'
import useEmailComposeStore from './state/use-email-compose-store'
import EmailComposeDrawer from './ui/email-compose-drawer'
import EmailView from './ui/email-view'
import EmailsTable from './ui/emails-table'
import EmptyImapSelect from './ui/empty-imap-select'
import QueueNotice from './ui/queue-notice'

const sentBy = (email: Email) => {
  if (email.sent_from === config.PLUGIN_SLUG) {
    return email.sender_name ?? ''
  }

  return email.email_direction === MAIL_DIRECTION.SENT ? email.imap_username : email.entity_name
}

const formatEmails = (emails: Email[]) =>
  emails.map(email => {
    const entityName = email.entity_name.trim()

    return {
      emailDate: formatDateTime(email.email_date),
      emailDirection: email.email_direction,
      entityEmail: email.entity_email,
      entityName: entityName,
      id: email.id,
      imapUsername: email.imap_username,
      key: email.id,
      receivedBy:
        email.email_direction === MAIL_DIRECTION.RECEIVED ? email.imap_username : email.entity_email,
      sentBy: sentBy(email),
      status: email.email_direction,
      subject: email.subject
    }
  })

const generateFieldOptions = (fields: FieldItem[]) => {
  const options: { label: string; value: string }[] = []

  fields.forEach(field => {
    if (field.type === 'section') {
      return
    }

    if (field.group_fields) {
      const nestedOptions = generateFieldOptions(Object.values(field.group_fields))
      options.push(...nestedOptions)
    } else {
      options.push({
        label: field.label,
        value: `{${field.field_key}}`
      })
    }
  })

  return options
}

interface EntityEmailsProps {
  email: string
  entityId: number
  fields: FieldItem[]
  module: EntityModule
}

const defaultImap = {
  id: 0,
  platform: '',
  status: false,
  title: __(''),
  username: '',
  visibility: false
}

export default function EntityEmails({ email, entityId, fields, module }: EntityEmailsProps) {
  const [activeImap, setActiveImap] = useState<Imap>(defaultImap)
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || 1)
  const perPage = Number(searchParams.get('perPage') || 10)
  const searchTerm = searchParams.get('searchTerm') || ''
  const sortBy = searchParams.get('sortBy') || ''
  const sortOrder = searchParams.get('sortOrder') || ''
  const pluginSlug = config.PLUGIN_SLUG
  const source = searchParams.get('source') || pluginSlug
  const { messageApi } = useContext(NotifyContext)

  const { imaps, isImapsFetching, isImapsLoading, totalImaps } = useImapSettings()

  const emailsFilter = useMemo(
    () => ({
      entity_email: email,
      imap_id: activeImap.id,
      module,
      page,
      perPage,
      searchTerm,
      sortBy,
      sortOrder,
      source
    }),
    [email, activeImap.id, page, perPage, sortBy, sortOrder, searchTerm, module, source]
  )

  const debouncedQueryParams = useDebounceState(emailsFilter, 300)

  const { emails, isEmailsFetching, isEmailsLoading, isEmailsSuccess, totalEmails } =
    useEmails(debouncedQueryParams)

  const { isAutoSyncingImap } = useAutoSyncImap(
    {
      autoSync: true,
      email,
      imap_id: activeImap.id,
      module
    },
    isEmailsSuccess &&
      (page === undefined || page === 1 ? true : false) &&
      checkCapability(CAPABILITIES.SETTING.IMAP) &&
      activeImap.id !== 0 &&
      source !== pluginSlug
  )

  const { isSyncingImap, syncImap } = useSyncImap()
  const { handleComposeOpen } = useEmailComposeStore()

  const handleSyncImap = async () => {
    const { data, status } = await syncImap({
      autoSync: false,
      email,
      imap_id: activeImap.id,
      module
    }).catch(error => error as Response<ValidationType<Email>>)
    if (status === 'error') {
      return messageApi?.error((data as string) || 'Something went wrong.')
    }
  }

  const handleActiveImap = (imaps: Imap[], id: number | string) => {
    const imap = imaps.find(item => item.id === id)
    if (!imap?.id) return
    setActiveImap(imap)
  }

  useEffect(() => {
    if (imaps?.length) {
      setActiveImap(imaps[0])
    } else {
      setActiveImap(defaultImap)
    }
  }, [imaps])

  const handleSourceChange = (value: string) => {
    setSearchParams(prev => {
      prev.set('source', value)
      return prev
    })
  }

  return (
    <>
      <If conditions={!email}>
        <Alert
          className="mb-2"
          message={__('Unable to display emails. No email found for this entity!')}
          type="error"
        />
      </If>

      <QueueNotice email={email} imapId={activeImap.id} />

      <div className="rounded-md border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-wrap items-center justify-between gap-2 p-2">
          <div className="flex flex-wrap items-center gap-2">
            <Select
              className="w-52 [&_.ant-select-selection-item]:rounded-full [&_.ant-select-selector]:rounded-full"
              disabled={!email}
              onChange={handleSourceChange}
              options={[
                { label: __('Sent via CRM'), value: pluginSlug },
                { label: __('All'), value: 'all' }
              ]}
              placeholder={__('Filter Emails')}
              value={source}
            />
            <Select
              className="w-52 [&_.ant-select-selection-item]:rounded-full [&_.ant-select-selector]:rounded-full"
              disabled={source === pluginSlug}
              loading={isImapsLoading}
              notFoundContent={<EmptyImapSelect />}
              onChange={value => handleActiveImap(imaps, value)}
              options={imaps?.map(imap => ({
                label: imap.title,
                value: imap.id
              }))}
              placeholder={__('Select an Imap Account')}
              value={activeImap.id || undefined}
            />
            <Button
              className={cn(['rounded-full', source === pluginSlug && 'hidden'])}
              disabled={
                !checkCapability(CAPABILITIES.SETTING.IMAP) ||
                !totalImaps ||
                isAutoSyncingImap ||
                isEmailsFetching ||
                source === pluginSlug
              }
              icon={<LuRefreshCcw size={14} />}
              loading={isSyncingImap}
              onClick={handleSyncImap}
              size="large"
            >
              {__('Sync Imap Emails')}
            </Button>
            <If conditions={isImapsFetching || isEmailsFetching || isAutoSyncingImap}>
              <LoadingOutlined />
            </If>
            <If conditions={isAutoSyncingImap}>
              <Typography.Paragraph className="mb-0 text-nowrap text-xs">
                {__('Imap Syncing...')}
              </Typography.Paragraph>
            </If>
          </div>
          <div className="flex flex-wrap gap-2">
            <SearchInput disabled={!email} placeholder={__('Search by name or email')} />
            <Button
              className="rounded-full"
              disabled={!email}
              icon={<LuPenLine size={14} />}
              onClick={handleComposeOpen}
              size="large"
              type="primary"
            >
              {__('Compose')}
            </Button>
          </div>
        </div>

        <div>
          <EmailsTable emails={formatEmails(emails)} isLoading={Boolean(email) && isEmailsLoading} />
          <div className="flex justify-center py-2">
            <Pagination total={totalEmails} />
          </div>
        </div>
      </div>

      <EmailView module={module} />
      <EmailComposeDrawer
        email={email}
        entityId={entityId}
        fieldOptions={generateFieldOptions(fields)}
        module={module}
      />
    </>
  )
}
