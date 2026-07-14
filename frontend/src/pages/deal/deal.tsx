import { LoadingOutlined } from '@ant-design/icons'
import CAPABILITIES from '@common/constants/capabilities'
import { MODULES } from '@common/constants/modules'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { renderFullName } from '@common/helpers/entity-helpers'
import { __ } from '@common/helpers/i18nWrap'
import useEntityRelatedListsCount from '@common/hooks/use-entity-related-lists-count'
import useTags from '@common/hooks/use-tags'
import { ICONS } from '@common/icons'
import Attachments from '@features/attachments'
import Calls from '@features/calls/calls'
import EntityEmails from '@features/entity-emails'
import EntitySummaryCard from '@features/entity-overview/ui/entity-summary-card'
import EntityUpcomingActivities from '@features/entity-overview/ui/entity-upcoming-activities'
import Links from '@features/links'
import Meetings from '@features/meetings/meetings'
import Notes from '@features/notes'
import Tasks from '@features/tasks'
import useDealFields from '@pages/deal-create/data/use-deal-fields'
import Breadcrumb from '@utilities/breadcrumb/breadcrumb'
import EntitySkeleton from '@utilities/entity-skeleton'
import If from '@utilities/If'
import PrevNextNavigation from '@utilities/prev-next-navigation'
import { Empty, Tabs, Tag } from 'antd'
import { type ReactNode } from 'react'
import { useParams, useSearchParams } from 'react-router'

import useDeal from './data/use-deal'
import DealInvoices from './internal/deal-invoices'
import DealOverview from './internal/deal-overview'
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
export default function Deal() {
  const { id: dealId } = useParams<{ id: string }>()
  const { columnSettings, fields, isFieldsPending } = useDealFields()
  const { deal, isDealError, isDealPending } = useDeal(dealId || 0)
  const { tags } = useTags({ module: MODULES.DEAL })
  const { attachmentCount, callCount, linkCount, meetingCount, noteCount, taskCount } =
    useEntityRelatedListsCount({ entityId: Number(dealId), module: MODULES.DEAL })
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  if (!dealId || isDealError)
    return <Empty className="flex h-full flex-col items-center justify-center" />

  return (
    <div className="space-y-5 p-6">
      {isFieldsPending || isDealPending || !deal ? (
        <EntitySkeleton />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <Breadcrumb
              items={[
                { title: __('Deals'), to: '/deals' },
                {
                  title: isDealPending ? (
                    <LoadingOutlined />
                  ) : (
                    renderFullName(undefined, undefined, deal?.name)
                  )
                }
              ]}
            />
            <div className="flex items-center gap-2">
              <PrevNextNavigation
                module={MODULES.DEAL}
                nextId={deal?.next_id}
                previousId={deal?.previous_id}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              <EntitySummaryCard
                actions={<Actions id={dealId} />}
                entity={{
                  createdAt: deal.created_at,
                  createdBy: deal?.created_by_name,
                  email: deal?.email || '',
                  name: deal.name,
                  updatedAt: deal?.updated_at,
                  updatedBy: deal?.updated_by_name
                }}
              />
              <EntityUpcomingActivities entityId={Number(dealId)} module={MODULES.DEAL} />
            </div>
            <Tabs
              activeKey={activeTab}
              animated
              items={[
                {
                  children: (
                    <DealOverview
                      columnSettings={columnSettings}
                      deal={deal}
                      fields={fields}
                      key={dealId}
                      tags={tags}
                    />
                  ),
                  key: 'overview',
                  label: tabLabel(ICONS['overview'], __('Overview'))
                },
                {
                  children: (
                    <EntityEmails
                      email={deal?.email || ''}
                      entityId={Number(dealId)}
                      fields={fields}
                      module={MODULES.DEAL}
                    />
                  ),
                  disabled: !checkCapability(CAPABILITIES.DEAL.VIEW),
                  key: 'email',
                  label: tabLabel(ICONS['email'], __('Emails'))
                },
                {
                  children: <Tasks entityId={Number(dealId)} fields={fields} module={MODULES.DEAL} />,
                  key: 'tasks',
                  label: tabLabel(ICONS['task'], __('Tasks'), taskCount)
                },
                {
                  children: <Meetings entityId={Number(dealId)} fields={fields} module={MODULES.DEAL} />,
                  key: 'meetings',
                  label: tabLabel(ICONS['meeting'], __('Meetings'), meetingCount)
                },
                {
                  children: <Calls entityId={Number(dealId)} fields={fields} module={MODULES.DEAL} />,
                  key: 'calls',
                  label: tabLabel(ICONS['call'], __('Calls'), callCount)
                },
                {
                  children: <Attachments entityId={Number(dealId)} module={MODULES.DEAL} />,
                  key: 'attachments',
                  label: tabLabel(ICONS['attachment'], __('Attachments'), attachmentCount)
                },
                {
                  children: <Notes entityId={Number(dealId)} fields={fields} module={MODULES.DEAL} />,
                  key: 'notes',
                  label: tabLabel(ICONS['note'], __('Notes'), noteCount)
                },
                {
                  children: <Links entityId={Number(dealId)} fields={fields} module={MODULES.DEAL} />,
                  key: 'links',
                  label: tabLabel(ICONS['link'], __('Links'), linkCount)
                },
                {
                  children: <DealInvoices entityId={Number(dealId)} module={MODULES.DEAL} />,
                  key: 'invoices',
                  label: __('Invoices')
                }
              ]}
              onChange={path => setSearchParams({ tab: path })}
            />
          </div>
        </>
      )}
    </div>
  )
}
