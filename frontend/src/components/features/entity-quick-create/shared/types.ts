import { type Product } from '@common/types/product'
import { type BaseFieldItemType } from '@features/entity-form/shared/entity-form-types'
import { type CompanyType } from '@pages/company/shared/company-types'
import { type ContactType } from '@pages/contact/shared/contact-types'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'
import { type Deal } from '@pages/deal/shared/deal-types'
import { type LeadType } from '@pages/lead/shared/lead-types'
import { type FormInstance } from 'antd'

export interface EntityQuickCreateModalProps {
  currencyData?: CurrencyItemType
  form: FormInstance
}

export interface EntityQuickCreateFormProps {
  currencyData?: CurrencyItemType
  fields: BaseFieldItemType[]
  form: FormInstance
}

export type StoreEntityResponse = CompanyType | ContactType | Deal | LeadType | Product

export interface StoreEntityPayload {
  customFieldsValues: Record<string, Record<string, unknown>>
  systemDefinedFieldsValues: Record<string, unknown>
}
