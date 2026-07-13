import { cn } from '@common/helpers/globalHelpers'
import { type ReactNode } from 'react'

interface DashboardCardProps {
  children: ReactNode
  className?: string
}

export default function DashboardCard({ children, className = '' }: DashboardCardProps) {
  return (
    <div
      className={cn(
        'rounded-[14px] border border-solid border-[#E5E3FE] bg-white !p-6 dark:border-neutral-700 dark:bg-neutral-900',
        className
      )}
    >
      {children}
    </div>
  )
}
