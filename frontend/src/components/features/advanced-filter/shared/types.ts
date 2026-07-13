export interface FilterOperator {
  label: string
  value: string
}

export interface FilterCondition {
  field_key: string
  field_type?: string
  is_custom?: boolean
  operator: string
  value: number | string | string[] | undefined
}

export interface FilterField {
  formatted_type: string
  is_custom?: boolean
  label: string
  options?: { label: string; value: string }[]
  related_module?: string
  type: string
  value: string
}

export interface AdvancedFilterItemProps {
  errors: FilterItemErrors
  filter: FilterCondition
  filterableFields: FilterField[]
  onRemove: () => void
  onUpdate: (updates: Partial<FilterCondition>) => void
  shouldShowRemoveButton: boolean
}

export interface FilterInputProps {
  error: false | string | undefined
  filter: FilterCondition
  filterableFields: FilterField[]
  onUpdate: (updates: Partial<FilterCondition>) => void
}

export interface FilterItemErrors {
  field_key?: string
  operator?: string
  value?: string
}
