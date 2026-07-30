import { LEAD_FORM_TEMPLATE_LIST, UPCOMING_TEMPLATE_PLACEHOLDER } from '../shared/constants'
import LeadFormTemplateCard from './lead-form-template-card'

interface LeadFormTemplatePickerProps {
  onChange?: (slug: string) => void
  onSelect?: (slug: string) => void
  value?: string
}

export default function LeadFormTemplatePicker({
  onChange,
  onSelect,
  value
}: LeadFormTemplatePickerProps) {
  const handleSelect = (slug: string) => {
    onChange?.(slug)
    onSelect?.(slug)
  }

  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup">
      {LEAD_FORM_TEMPLATE_LIST.map(template => (
        <LeadFormTemplateCard
          isSelected={value === template.slug}
          key={template.slug}
          onSelect={handleSelect}
          template={template}
        />
      ))}

      <LeadFormTemplateCard
        isDisabled
        isSelected={false}
        onSelect={handleSelect}
        template={UPCOMING_TEMPLATE_PLACEHOLDER}
      />
    </div>
  )
}
