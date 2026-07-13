export interface UpdateCustomFieldPayloadType {
  help_text?: string
  id: number
  label?: string
  max?: number
  min?: number
  options?: FieldOption[]
  required?: boolean
  status?: boolean
  tooltip?: string
  width?: string
}

export interface Order {
  field_key: string
  order: number
}

export interface UpdateCustomFieldResponseType<T> {
  data: {
    fields: T[]
    orders: Order[]
  }
}

export interface FieldOption {
  label: string
  value: string
}

export interface CustomFieldType {
  attributes: {
    help_text?: string
    max?: number
    min?: number
    options?: FieldOption[]
    tooltip?: string
  }
  created_at: string
  field_key: string
  id: number
  label: string
  module: string
  type: string
  updated_at: string
}

export type StoreCustomFieldPayloadType = Partial<CustomFieldType>

export interface BaseFieldType {
  default_value?: string
  field_key: string
  group_fields?: Record<string, BaseFieldType>
  id: number
  is_always_required?: boolean
  is_custom?: boolean
  is_editable?: boolean
  label: string
  name: string
  required: boolean
  status: boolean
  type: string
  width?: string
}
export interface FieldWrapperPropsType<T> {
  children: React.ReactNode
  item: T
  module: string
}

export interface FieldRendererPropsType {
  id?: number
  isCustom?: boolean
  isGroup?: boolean
  isSection?: boolean
  label: string
  type: string
}

export interface EditFieldModalPropsType {
  item: BaseFieldType
  module: string
}

export interface CustomFieldRowActionsPropsType {
  item: BaseFieldType
  module: string
}

export interface AddNewFieldModalPropsType {
  module: string
}

export interface EditFieldsGroupModalPropsType<T> {
  item: T
  onStateChange: (values: Record<string, Record<string, boolean>>) => Promise<void>
}
