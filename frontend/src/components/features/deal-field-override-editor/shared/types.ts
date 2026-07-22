import { type FormInstance } from 'antd'

export interface DealFieldOverrideEditorProps {
  form: FormInstance
  initialFieldOverrides?: FieldOverride[]
}

export interface FieldOverride {
  fieldKey?: string
  id: string
}
