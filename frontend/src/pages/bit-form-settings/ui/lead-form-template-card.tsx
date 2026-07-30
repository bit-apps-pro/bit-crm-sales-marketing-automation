import { cn } from '@common/helpers/globalHelpers'
import { Typography } from 'antd'

import { type LeadFormTemplate } from '../shared/types'

interface LeadFormTemplateCardProps {
  isDisabled?: boolean
  isSelected: boolean
  onSelect: (slug: string) => void
  template: LeadFormTemplate
}

export default function LeadFormTemplateCard({
  isDisabled = false,
  isSelected,
  onSelect,
  template
}: LeadFormTemplateCardProps) {
  return (
    <button
      aria-checked={isDisabled ? false : isSelected}
      aria-disabled={isDisabled || undefined}
      className={cn(
        'flex h-full w-full flex-col gap-2 rounded-[14px] border border-solid bg-transparent p-3 text-left transition',
        isSelected ? 'border-primary' : 'border-[#E5E3FE] dark:border-neutral-700',
        isDisabled ? 'cursor-default border-dashed opacity-60' : 'cursor-pointer'
      )}
      onClick={() => !isDisabled && onSelect(template.slug)}
      role="radio"
      type="button"
    >
      <span className="min-w-0">
        <Typography.Text className="block text-sm font-semibold">{template.title}</Typography.Text>
        <Typography.Text className="block text-xs" type="secondary">
          {template.description}
        </Typography.Text>
      </span>
    </button>
  )
}
