import { $appConfig } from '@common/globalStates'
import { type BaseFieldItemType } from '@features/entity-form/shared/entity-form-types'
import { type CurrencyItemType } from '@pages/currencies/shared/currency-types'
import { type FormInstance } from 'antd'
import { Form } from 'antd'
import { useAtomValue } from 'jotai'

type CurrencyData = (
  fields: BaseFieldItemType[],
  form: FormInstance,
  currencyKey?: string
) => CurrencyItemType

const useCurrencyData: CurrencyData = (fields, form, currencyKey = 'currency') => {
  const currency = Form.useWatch(currencyKey, form)
  const { homeCurrencyData } = useAtomValue($appConfig)

  if (!currency) {
    return homeCurrencyData
  }

  const currencyField = fields?.find(f => f?.field_key === currencyKey)
  if (!currencyField?.options) {
    return homeCurrencyData
  }

  const selectedCurrencyOption = currencyField?.options?.find(opt => opt?.value === currency)?.data

  return selectedCurrencyOption || homeCurrencyData
}

export default useCurrencyData
