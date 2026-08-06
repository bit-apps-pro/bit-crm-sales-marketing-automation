import CAPABILITIES from '@common/constants/capabilities'
import { MODULES } from '@common/constants/modules'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { renderFullName } from '@common/helpers/entity-helpers'
import { __ } from '@common/helpers/i18nWrap'
import useEntityRelatedListsCount from '@common/hooks/use-entity-related-lists-count'
import useTags from '@common/hooks/use-tags'
import { ICONS } from '@common/icons'
import Attachments from '@features/attachments'
import Calls from '@features/calls'
import EntityEmails from '@features/entity-emails'
import EntitySummaryCard from '@features/entity-overview/ui/entity-summary-card'
import EntityUpcomingActivities from '@features/entity-overview/ui/entity-upcoming-activities'
import Links from '@features/links'
import Meetings from '@features/meetings'
import Notes from '@features/notes'
import RelatedEntities from '@features/related-entities'
import Tasks from '@features/tasks'
import useContactFields from '@pages/contact-create/data/use-contact-fields'
import Breadcrumb from '@utilities/breadcrumb/breadcrumb'
import EntitySkeleton from '@utilities/entity-skeleton'
import If from '@utilities/If'
import PrevNextNavigation from '@utilities/prev-next-navigation'
import { Empty, Tabs, Tag } from 'antd'
import { type ReactNode } from 'react'
import { useParams, useSearchParams } from 'react-router'

import useContact from './data/use-contact'
import ContactOverview from './internal/contact-overview'
import Actions from './ui/actions'

const tabLabel = (icon: ReactNode, text: string, count?: string) => (
  <span className="flex items-center gap-1.5">
    {icon}
    {text}
    <If conditions={count}>
      <Tag className="m-0">{count}</Tag>
    </If>
  </span>
)

const Contact = () => {
  const { id: contactId } = useParams()
  const { columnSettings, fields, isFieldsLoading } = useContactFields()
  const { contact, isContactError, isContactLoading, refetchContact } = useContact(contactId)
  const { refetchTags, tags } = useTags({ module: MODULES.CONTACT })
  const { attachmentCount, callCount, linkCount, meetingCount, noteCount, taskCount } =
    useEntityRelatedListsCount({ entityId: Number(contactId), module: MODULES.CONTACT })
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  if (!contactId || isContactError)
    return <Empty className="flex h-full flex-col items-center justify-center" />

  return (
    <div className="space-y-5 px-6 py-4">
      {isFieldsLoading || isContactLoading || !contact ? (
        <EntitySkeleton />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Breadcrumb
              items={[
                { title: __('Contacts'), to: '/contacts' },
                {
                  title: renderFullName(contact?.title, contact?.first_name, contact?.last_name)
                }
              ]}
            />
            <div className="flex items-center gap-2">
              <PrevNextNavigation
                module={MODULES.CONTACT}
                nextId={contact?.next_id}
                previousId={contact?.previous_id}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-4">
              <EntitySummaryCard
                actions={<Actions id={contactId} />}
                entity={{
                  createdAt: contact.created_at,
                  createdBy: contact?.created_by_name,
                  email: contact?.email || '',
                  name: renderFullName(contact?.title, contact?.first_name, contact.last_name),
                  phone: contact?.phone || contact?.mobile || '',
                  updatedAt: contact?.updated_at,
                  updatedBy: contact?.updated_by_name
                }}
              />
              <EntityUpcomingActivities entityId={Number(contactId)} module={MODULES.CONTACT} />
            </div>
            <Tabs
              activeKey={activeTab}
              destroyOnHidden
              items={[
                {
                  capability: CAPABILITIES.CONTACT.VIEW,
                  children: (
                    <ContactOverview
                      columnSettings={columnSettings}
                      contact={contact}
                      fields={fields}
                      key={contactId}
                      refetchContact={refetchContact}
                      refetchTags={refetchTags}
                      tags={tags}
                    />
                  ),
                  key: 'overview',
                  label: tabLabel(ICONS['overview'], __('Overview'))
                },
                {
                  capability: CAPABILITIES.CONTACT.VIEW,
                  children: (
                    <EntityEmails
                      email={contact?.email || ''}
                      entityId={Number(contactId)}
                      fields={fields}
                      module={MODULES.CONTACT}
                    />
                  ),
                  key: 'email',
                  label: tabLabel(ICONS['email'], __('Emails'))
                },
                {
                  capability: CAPABILITIES.ACTIVITY.VIEW,
                  children: (
                    <Tasks entityId={Number(contactId)} fields={fields} module={MODULES.CONTACT} />
                  ),
                  key: 'tasks',
                  label: tabLabel(ICONS['task'], __('Tasks'), taskCount)
                },
                {
                  capability: CAPABILITIES.ACTIVITY.VIEW,
                  children: (
                    <Meetings entityId={Number(contactId)} fields={fields} module={MODULES.CONTACT} />
                  ),
                  key: 'meetings',
                  label: tabLabel(ICONS['meeting'], __('Meetings'), meetingCount)
                },
                {
                  capability: CAPABILITIES.ACTIVITY.VIEW,
                  children: (
                    <Calls entityId={Number(contactId)} fields={fields} module={MODULES.CONTACT} />
                  ),
                  key: 'calls',
                  label: tabLabel(ICONS['call'], __('Calls'), callCount)
                },
                {
                  capability: CAPABILITIES.ATTACHMENT.VIEW,
                  children: <Attachments entityId={Number(contactId)} module={MODULES.CONTACT} />,
                  key: 'attachments',
                  label: tabLabel(ICONS['attachment'], __('Attachments'), attachmentCount)
                },
                {
                  capability: CAPABILITIES.NOTE.VIEW,
                  children: (
                    <Notes entityId={Number(contactId)} fields={fields} module={MODULES.CONTACT} />
                  ),
                  key: 'notes',
                  label: tabLabel(ICONS['note'], __('Notes'), noteCount)
                },
                {
                  capability: CAPABILITIES.LINK.VIEW,
                  children: (
                    <Links entityId={Number(contactId)} fields={fields} module={MODULES.CONTACT} />
                  ),
                  key: 'links',
                  label: tabLabel(ICONS['link'], __('Links'), linkCount)
                },
                {
                  capability: CAPABILITIES.DEAL.VIEW,
                  children: (
                    <RelatedEntities
                      detachable={false}
                      entity={MODULES.CONTACT}
                      entityId={Number(contactId)}
                      relatedEntity={MODULES.DEAL}
                    />
                  ),
                  key: 'deals',
                  label: __('Deals')
                }
              ].filter(tab => tab.capability && checkCapability(tab.capability))}
              onChange={path => setSearchParams({ tab: path })}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default Contact
