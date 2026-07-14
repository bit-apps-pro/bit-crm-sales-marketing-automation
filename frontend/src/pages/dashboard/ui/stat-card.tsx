import { cn } from '@common/helpers/globalHelpers'
import { Statistic, Typography } from 'antd'
import { type ReactNode } from 'react'
import { LuArrowDownRight, LuArrowUpRight } from 'react-icons/lu'
import { Link } from 'react-router'

import DashboardCard from './dashboard-card'

interface StatCardProps {
  changeLabel?: string
  changePercent?: number
  href?: string
  icon: ReactNode
  title: string
  trend?: 'down' | 'up'
  value: number | string
}

export default function StatCard({
  changeLabel,
  changePercent,
  href,
  icon,
  title,
  trend,
  value
}: StatCardProps) {
  return (
    <DashboardCard className="relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#EEF0FB] text-primary dark:bg-zinc-800">
              {icon}
            </div>
            <Typography.Title className="mb-0 text-[#9090A8]" level={5}>
              {title}
            </Typography.Title>
          </div>
          <div>
            <Link
              className="flex h-7 w-7 min-w-0 items-center justify-center rounded-full border-none bg-[#EEF0FB] transition-colors hover:bg-[#E3E6F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:bg-zinc-800 dark:hover:bg-slate-700"
              to={href ?? ''}
            >
              <LuArrowUpRight className="text-primary" />
            </Link>
          </div>
        </div>

        <div className="mt-5">
          <Statistic value={value} valueStyle={{ fontSize: 42, fontWeight: 700, lineHeight: 1 }} />
          {changePercent !== undefined && (
            <div className="mt-1.5 flex items-center gap-1 text-[13px]">
              {trend === 'up' && <LuArrowUpRight className="text-green-500" size={14} />}
              {trend === 'down' && <LuArrowDownRight className="text-red-500" size={14} />}
              <Typography.Text
                className={cn(
                  trend === undefined && 'text-[#9090A8]',
                  trend === 'up' && 'text-green-500',
                  trend === 'down' && 'text-red-500'
                )}
              >
                {changePercent}%
              </Typography.Text>
              {changeLabel && (
                <Typography.Text className="text-[#9090A8]">{changeLabel}</Typography.Text>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardCard>
  )
}
