import { __ } from '@common/helpers/i18nWrap'

import { type FilterCondition, type FilterOperator } from './types'

export const NEW_FILTER: FilterCondition = {
  field_key: '',
  operator: 'contains',
  value: ''
}

export const FILTER_OPERATORS_WITHOUT_VALUE = ['is_empty', 'is_not_empty'] as const
export const LOOKUP_FIELD_TYPES = ['lookup_select', 'lookup_autocomplete'] as const
export const MULTI_SELECT_FIELD_TYPES = new Set(['checkbox', 'multi-select'])
export const SELECT_FIELD_TYPES = new Set(['radio', 'select', ...LOOKUP_FIELD_TYPES])
export const TEXT_FIELD_TYPES = new Set(['text', 'textarea'])
export const NON_FILTERABLE_FIELD_KEYS = new Set(['full_name'])
export const NON_FILTERABLE_FIELD_TYPES = new Set(['section'])

export const FILTER_OPERATORS: Record<string, FilterOperator[]> = {
  date: [
    { label: __('Is'), value: 'equals' },
    { label: __('Is after'), value: 'greater_than' },
    { label: __('Is before'), value: 'less_than' },
    { label: __('Is on or after'), value: 'greater_than_equal' },
    { label: __('Is on or before'), value: 'less_than_equal' },
    { label: __('Is between'), value: 'between' },
    { label: __('Is not between'), value: 'not_between' },
    { label: __('Is empty'), value: 'is_empty' },
    { label: __('Is not empty'), value: 'is_not_empty' }
  ],
  email: [
    { label: __('Contains'), value: 'contains' },
    { label: __('Equals'), value: 'equals' },
    { label: __('Is empty'), value: 'is_empty' },
    { label: __('Is not empty'), value: 'is_not_empty' }
  ],
  'multi-select': [
    { label: __('Contains'), value: 'contains' },
    { label: __('Does not contain'), value: 'not_contains' },
    { label: __('Is empty'), value: 'is_empty' },
    { label: __('Is not empty'), value: 'is_not_empty' }
  ],
  number: [
    { label: __('Equals'), value: 'equals' },
    { label: __('Greater than'), value: 'greater_than' },
    { label: __('Less than'), value: 'less_than' },
    { label: __('Greater than or equal'), value: 'greater_than_equal' },
    { label: __('Less than or equal'), value: 'less_than_equal' },
    { label: __('Is empty'), value: 'is_empty' },
    { label: __('Is not empty'), value: 'is_not_empty' }
  ],
  select: [
    { label: __('Is'), value: 'equals' },
    { label: __('Is not'), value: 'not_equals' },
    { label: __('Is empty'), value: 'is_empty' },
    { label: __('Is not empty'), value: 'is_not_empty' }
  ],
  text: [
    { label: __('Contains'), value: 'contains' },
    { label: __('Equals'), value: 'equals' },
    { label: __('Starts with'), value: 'starts_with' },
    { label: __('Ends with'), value: 'ends_with' },
    { label: __('Is empty'), value: 'is_empty' },
    { label: __('Is not empty'), value: 'is_not_empty' }
  ]
}
