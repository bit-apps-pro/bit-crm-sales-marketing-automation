import CAPABILITIES from '@common/constants/capabilities'
import { MODULES } from '@common/constants/modules'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import useEntityRelatedListsCount from '@common/hooks/use-entity-related-lists-count'
import useTags from '@common/hooks/use-tags'
import { ICONS } from '@common/icons'
import Attachments from '@features/attachments'
import Calls from '@features/calls'
import EntitySummaryCard from '@features/entity-overview/ui/entity-summary-card'
import EntityUpcomingActivities from '@features/entity-overview/ui/entity-upcoming-activities'
import Links from '@features/links'
import Meetings from '@features/meetings'
import Notes from '@features/notes'
import RelatedEntities from '@features/related-entities'
import Tasks from '@features/tasks'
import useCompanyFields from '@pages/company-create/data/use-company-fields'
import Breadcrumb from '@utilities/breadcrumb/breadcrumb'
import EntitySkeleton from '@utilities/entity-skeleton'
import If from '@utilities/If'
import PrevNextNavigation from '@utilities/prev-next-navigation'
import { Empty, Tabs, Tag } from 'antd'
import { type ReactNode } from 'react'
import { useParams, useSearchParams } from 'react-router'

import useCompany from './data/use-company'
import CompanyOverview from './internal/company-overview'
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

export default function Company() {
  const { id: companyId } = useParams()
  const { columnSettings, fields, isFieldsPending } = useCompanyFields()
  const { company, isCompanyError, isCompanyPending, refetchCompany } = useCompany(companyId || 0)
  const { refetchTags, tags } = useTags({ module: MODULES.COMPANY })
  const { attachmentCount, callCount, linkCount, meetingCount, noteCount, taskCount } =
    useEntityRelatedListsCount({ entityId: Number(companyId), module: MODULES.COMPANY })
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  if (!companyId || isCompanyError)
    return <Empty className="flex h-full flex-col items-center justify-center" />

  return (
    <div className="space-y-5 px-6 py-4">
      {isFieldsPending || isCompanyPending || !company ? (
        <EntitySkeleton />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Breadcrumb
              items={[
                { title: __('Companies'), to: '/companies' },
                {
                  title: company?.name || __('Company Details')
                }
              ]}
            />

            <div className="flex items-center gap-2">
              <PrevNextNavigation
                module={MODULES.COMPANY}
                nextId={company?.next_id}
                previousId={company?.previous_id}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-4">
              <EntitySummaryCard
                actions={<Actions id={companyId} />}
                entity={{
                  createdAt: company.created_at,
                  createdBy: company?.created_by_name,
                  email: company?.email || '',
                  name: company.name,
                  phone: company?.phone || '',
                  updatedAt: company?.updated_at,
                  updatedBy: company?.updated_by_name
                }}
              />
              <EntityUpcomingActivities entityId={Number(companyId)} module={MODULES.COMPANY} />
            </div>
            <Tabs
              activeKey={activeTab}
              destroyOnHidden
              items={[
                {
                  capability: CAPABILITIES.COMPANY.VIEW,
                  children: (
                    <CompanyOverview
                      columnSettings={columnSettings}
                      company={company}
                      fields={fields}
                      key={companyId}
                      refetchCompany={refetchCompany}
                      refetchTags={refetchTags}
                      tags={tags}
                    />
                  ),
                  key: 'overview',
                  label: tabLabel(ICONS['overview'], __('Overview'))
                },
                {
                  capability: CAPABILITIES.ACTIVITY.VIEW,
                  children: (
                    <Tasks entityId={Number(companyId)} fields={fields} module={MODULES.COMPANY} />
                  ),
                  key: 'tasks',
                  label: tabLabel(ICONS['task'], __('Tasks'), taskCount)
                },
                {
                  capability: CAPABILITIES.ACTIVITY.VIEW,
                  children: (
                    <Meetings entityId={Number(companyId)} fields={fields} module={MODULES.COMPANY} />
                  ),
                  key: 'meetings',
                  label: tabLabel(ICONS['meeting'], __('Meetings'), meetingCount)
                },
                {
                  capability: CAPABILITIES.ACTIVITY.VIEW,
                  children: (
                    <Calls entityId={Number(companyId)} fields={fields} module={MODULES.COMPANY} />
                  ),
                  key: 'calls',
                  label: tabLabel(ICONS['call'], __('Calls'), callCount)
                },
                {
                  capability: CAPABILITIES.ATTACHMENT.VIEW,
                  children: <Attachments entityId={Number(companyId)} module={MODULES.COMPANY} />,
                  key: 'attachments',
                  label: tabLabel(ICONS['attachment'], __('Attachments'), attachmentCount)
                },
                {
                  capability: CAPABILITIES.NOTE.VIEW,
                  children: (
                    <Notes entityId={Number(companyId)} fields={fields} module={MODULES.COMPANY} />
                  ),
                  key: 'notes',
                  label: tabLabel(ICONS['note'], __('Notes'), noteCount)
                },
                {
                  capability: CAPABILITIES.LINK.VIEW,
                  children: (
                    <Links entityId={Number(companyId)} fields={fields} module={MODULES.COMPANY} />
                  ),
                  key: 'links',
                  label: tabLabel(ICONS['link'], __('Links'), linkCount)
                },
                {
                  capability: CAPABILITIES.CONTACT.VIEW,
                  children: (
                    <RelatedEntities
                      detachable={true}
                      entity={MODULES.COMPANY}
                      entityId={Number(companyId)}
                      relatedEntity={MODULES.CONTACT}
                    />
                  ),
                  key: 'contacts',
                  label: __('Contacts')
                },
                {
                  capability: CAPABILITIES.DEAL.VIEW,
                  children: (
                    <RelatedEntities
                      detachable={true}
                      entity={MODULES.COMPANY}
                      entityId={Number(companyId)}
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
