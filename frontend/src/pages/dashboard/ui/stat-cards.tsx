import CAPABILITIES from '@common/constants/capabilities'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { LuBuilding2, LuFileText, LuHandshake, LuMagnet, LuUser } from 'react-icons/lu'

import { type DashboardStats } from '../shared/types'
import StatCard from './stat-card'

interface StatCardsProps {
  stats: DashboardStats
}

export default function StatCards({ stats }: StatCardsProps) {
  const { companies, contacts, deals, invoices, leads } = stats
  const cards = [
    {
      capabilities: CAPABILITIES.LEAD.VIEW,
      href: '/leads',
      icon: <LuMagnet size={16} />,
      stats: leads,
      title: __('Leads')
    },
    {
      capabilities: CAPABILITIES.CONTACT.VIEW,
      href: '/contacts',
      icon: <LuUser size={16} />,
      stats: contacts,
      title: __('Contacts')
    },
    {
      capabilities: CAPABILITIES.COMPANY.VIEW,
      href: '/companies',
      icon: <LuBuilding2 size={16} />,
      stats: companies,
      title: __('Companies')
    },
    {
      capabilities: CAPABILITIES.DEAL.VIEW,
      href: '/deals',
      icon: <LuHandshake size={16} />,
      stats: deals,
      title: __('Deals')
    },
    {
      capabilities: CAPABILITIES.INVOICE.VIEW,
      href: '/invoices',
      icon: <LuFileText size={16} />,
      stats: invoices,
      title: __('Invoices')
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
      {cards.map(({ capabilities, href, icon, stats, title }) => (
        <If conditions={checkCapability(capabilities)} key={href}>
          <StatCard
            changeLabel={__('vs last month')}
            changePercent={stats.percentageChange}
            href={href}
            icon={icon}
            title={title}
            trend={stats.trend === 'flat' ? undefined : stats.trend}
            value={stats.total}
          />
        </If>
      ))}
    </div>
  )
}
