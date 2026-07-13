import { type FormInstance } from 'antd'

export interface DealFieldOverrideEditorProps {
  form: FormInstance
}

export interface FieldOverride {
  fieldKey?: string
  id: string
}
