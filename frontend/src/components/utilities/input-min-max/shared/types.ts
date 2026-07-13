import { type FormInstance } from 'antd'

export interface InputMinMaxProps {
  form: FormInstance
  maxLabel?: string
  maxName?: string | string[]
  minLabel?: string
  minName?: string | string[]
}

export type CreateMinMaxValidator = (
  form: FormInstance,
  compareFieldName: string | string[],
  validationType: 'max' | 'min'
) => (_: unknown, value: null | number | undefined) => Promise<void>
