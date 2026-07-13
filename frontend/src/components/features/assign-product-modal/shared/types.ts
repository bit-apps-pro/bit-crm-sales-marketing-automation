import { type LineItem } from '@features/product-line-items/shared/types'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'
import { type FormInstance } from 'antd'

export interface AssignProductModalProps {
  currencyData: CurrencyItemType
  form: FormInstance
  loading?: boolean
  onSave?: (lineItems: LineItem[], amount: number) => Promise<void>
}
