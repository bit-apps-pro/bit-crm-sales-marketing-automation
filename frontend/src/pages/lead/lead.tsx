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
import Tasks from '@features/tasks'
import useLeadFields from '@pages/lead-create/data/use-lead-fields'
import Breadcrumb from '@utilities/breadcrumb/breadcrumb'
import EntitySkeleton from '@utilities/entity-skeleton'
import If from '@utilities/If'
import PrevNextNavigation from '@utilities/prev-next-navigation'
import { Empty, Tabs, Tag } from 'antd'
import { type ReactNode } from 'react'
import { useParams, useSearchParams } from 'react-router'

import useLead from './data/use-lead'
import LeadOverview from './internal/lead-overview'
import Actions from './ui/actions'
import LeadStatus from './ui/lead-status'

const tabLabel = (icon: ReactNode, text: string, count?: string) => (
  <span className="flex items-center gap-1.5">
    {icon}
    {text}
    <If conditions={count}>
      <Tag className="m-0">{count}</Tag>
    </If>
  </span>
)

const Lead = () => {
  const { id: leadId } = useParams()
  const { columnSettings, fields, isFieldsLoading } = useLeadFields()
  const { isLeadError, isLeadPending, lead, refetchLead } = useLead(leadId)
  const { refetchTags, tags } = useTags({ module: MODULES.LEAD })
  const { attachmentCount, callCount, linkCount, meetingCount, noteCount, taskCount } =
    useEntityRelatedListsCount({ entityId: Number(leadId), module: MODULES.LEAD })
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  if (!leadId || isLeadError)
    return <Empty className="flex h-full flex-col items-center justify-center" />

  return (
    <div className="space-y-5 p-6">
      {isFieldsLoading || isLeadPending || !lead ? (
        <EntitySkeleton />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Breadcrumb
              items={[
                { title: __('Leads'), to: '/leads' },
                {
                  title: renderFullName(lead?.title, lead?.first_name, lead?.last_name)
                }
              ]}
            />
            <div className="flex items-center gap-2">
              <PrevNextNavigation
                module={MODULES.LEAD}
                nextId={lead?.next_id}
                previousId={lead?.previous_id}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-4">
              <EntitySummaryCard
                actions={<Actions id={leadId} />}
                entity={{
                  createdAt: lead.created_at,
                  createdBy: lead?.created_by_name,
                  email: lead?.email,
                  name: renderFullName(lead?.title, lead?.first_name, lead.last_name),
                  phone: lead?.phone || '',
                  status: lead?.lead_status ? (
                    <LeadStatus fields={fields} status={lead?.lead_status} />
                  ) : undefined,
                  updatedAt: lead?.updated_at,
                  updatedBy: lead?.updated_by_name
                }}
              />
              <EntityUpcomingActivities entityId={Number(leadId)} module={MODULES.LEAD} />
            </div>
            <Tabs
              activeKey={activeTab}
              destroyOnHidden
              items={[
                {
                  capability: CAPABILITIES.LEAD.VIEW,
                  children: (
                    <LeadOverview
                      columnSettings={columnSettings}
                      fields={fields}
                      key={leadId}
                      lead={lead}
                      refetchLead={refetchLead}
                      refetchTags={refetchTags}
                      tags={tags}
                    />
                  ),
                  key: 'overview',
                  label: tabLabel(ICONS['overview'], __('Overview'))
                },
                {
                  capability: CAPABILITIES.LEAD.VIEW,
                  children: (
                    <EntityEmails
                      email={lead?.email}
                      entityId={Number(leadId)}
                      fields={fields}
                      module={MODULES.LEAD}
                    />
                  ),
                  key: 'email',
                  label: tabLabel(ICONS['email'], __('Emails'))
                },
                {
                  capability: CAPABILITIES.ACTIVITY.VIEW,
                  children: <Tasks entityId={Number(leadId)} fields={fields} module={MODULES.LEAD} />,
                  key: 'tasks',
                  label: tabLabel(ICONS['task'], __('Tasks'), taskCount)
                },
                {
                  capability: CAPABILITIES.ACTIVITY.VIEW,
                  children: <Meetings entityId={Number(leadId)} fields={fields} module={MODULES.LEAD} />,
                  key: 'meetings',
                  label: tabLabel(ICONS['meeting'], __('Meetings'), meetingCount)
                },
                {
                  capability: CAPABILITIES.ACTIVITY.VIEW,
                  children: <Calls entityId={Number(leadId)} fields={fields} module={MODULES.LEAD} />,
                  key: 'calls',
                  label: tabLabel(ICONS['call'], __('Calls'), callCount)
                },
                {
                  capability: CAPABILITIES.ATTACHMENT.VIEW,
                  children: <Attachments entityId={Number(leadId)} module={MODULES.LEAD} />,
                  key: 'attachments',
                  label: tabLabel(ICONS['attachment'], __('Attachments'), attachmentCount)
                },
                {
                  capability: CAPABILITIES.NOTE.VIEW,
                  children: <Notes entityId={Number(leadId)} fields={fields} module={MODULES.LEAD} />,
                  key: 'notes',
                  label: tabLabel(ICONS['note'], __('Notes'), noteCount)
                },
                {
                  capability: CAPABILITIES.LINK.VIEW,
                  children: <Links entityId={Number(leadId)} fields={fields} module={MODULES.LEAD} />,
                  key: 'links',
                  label: tabLabel(ICONS['link'], __('Links'), linkCount)
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

export default Lead
