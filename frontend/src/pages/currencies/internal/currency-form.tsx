import { cn } from '@common/helpers/globalHelpers'
import { __ } from '@common/helpers/i18nWrap'
import customizedRequiredMark from '@utilities/customized-required-mark'
import If from '@utilities/If'
import { Form, Input, InputNumber, Select } from 'antd'
import { type FormInstance } from 'antd/lib/form'
import { useEffect } from 'react'

import useCurrencyStaticData from '../data/use-currency-static-data'
import {
  getDigitSeparatorOptions,
  getFormatKeyByCurrency,
  getPreviewByFormatKey
} from '../shared/common-functions'
import { DECIMAL_PLACES_OPTIONS, FORMAT_MAPPINGS } from '../shared/constants'
import { type CurrencyFormType, type CurrencyStaticDataType } from '../shared/currency-types'
import CurrencyFormSkeleton from './currency-form-skeleton'

interface CurrencyFormProps {
  defaultCurrency?: string
  form: FormInstance
  isEdit?: boolean
  isHome?: boolean
}

const { useWatch } = Form

export default function CurrencyForm({
  defaultCurrency,
  form,
  isEdit = false,
  isHome = false
}: CurrencyFormProps) {
  const { currencyOptions, currencyStaticData, isCurrencyStaticDataPending } = useCurrencyStaticData()

  const selectedCurrency = useWatch('currency', form) || defaultCurrency
  const decimalPlaces = useWatch('decimal_places', form)
  const symbol = useWatch('symbol', form)
  const thousandSeparatorSelector = useWatch('thousand_separator_selector', form)

  useEffect(() => {
    if (selectedCurrency && currencyStaticData[selectedCurrency] && !isEdit) {
      const currency: CurrencyStaticDataType = currencyStaticData[selectedCurrency]
      const formatKey = getFormatKeyByCurrency(currency)
      form.setFieldsValue({
        currency: selectedCurrency,
        decimal_places: currency.decimal_places,
        decimal_separator: currency.decimal_separator,
        symbol: currency.symbol[0] || currency.iso_code,
        thousand_separator: currency.thousand_separator,
        thousand_separator_selector: formatKey
      })
    }
  }, [selectedCurrency, currencyStaticData, form, isEdit])

  const handleValuesChange = (
    changedValues: Record<string, number | string>,
    allValues: CurrencyFormType
  ) => {
    if (changedValues.thousand_separator_selector) {
      const formatValue = FORMAT_MAPPINGS[changedValues.thousand_separator_selector]
      form.setFieldsValue({
        decimal_separator: formatValue.decimal_separator || '',
        thousand_separator: formatValue.thousand_separator || ''
      })
    }

    if ('decimal_places' in changedValues) {
      const currentFormatKey = allValues.thousand_separator_selector

      if (!currentFormatKey) return

      const parts = currentFormatKey.split('_')

      if (parts.length !== 3) return

      const newFormatKey =
        Number(changedValues.decimal_places) === 0
          ? `${parts[0]}_${parts[1]}_zero`
          : `${parts[0]}_${parts[1]}_${allValues.decimal_separator}`

      form.setFieldsValue({
        thousand_separator_selector: newFormatKey
      })
    }
  }

  if (isCurrencyStaticDataPending) {
    return <CurrencyFormSkeleton quantity={isEdit ? 3 : 4} />
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
      requiredMark={customizedRequiredMark}
    >
      <Form.Item
        hidden={isEdit}
        label={__('Currency')}
        name="currency"
        rules={[
          {
            message: __('The currency field is required!'),
            required: true
          }
        ]}
      >
        <Select
          disabled={isEdit}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={currencyOptions}
          placeholder={__('Select Currency')}
          showSearch
        />
      </Form.Item>

      <If conditions={selectedCurrency && currencyStaticData[selectedCurrency]}>
        <div className="grid grid-cols-2 gap-2">
          <Form.Item
            label={__('Symbol')}
            name="symbol"
            rules={[
              {
                message: __('The symbol field is required!'),
                required: true
              }
            ]}
          >
            <Select
              options={
                currencyStaticData[selectedCurrency]?.symbol?.map(symbol => ({
                  label: symbol,
                  value: symbol
                })) || []
              }
              placeholder={__('Select Symbol')}
            />
          </Form.Item>
          <Form.Item
            label={__('Decimal Places')}
            name="decimal_places"
            rules={[
              {
                message: __('The decimal places field is required!'),
                required: true
              }
            ]}
          >
            <Select options={DECIMAL_PLACES_OPTIONS} placeholder={__('Select Decimal Places')} />
          </Form.Item>
          <Form.Item
            className={cn([isHome && 'col-span-2'])}
            label={__('Digit Separators')}
            name="thousand_separator_selector"
            rules={[
              {
                message: __('The digit separators field is required!'),
                required: true
              }
            ]}
          >
            <Select
              options={getDigitSeparatorOptions(decimalPlaces)}
              placeholder={__('Select Format')}
            />
          </Form.Item>
          <Form.Item
            hidden={isHome}
            label={__('Exchange Rate')}
            name="exchange_rate"
            required
            rules={[
              {
                message: __('the exchange rate field is required'),
                required: !isHome
              }
            ]}
          >
            <InputNumber
              className="w-full"
              min={0}
              placeholder={__('Enter exchange rate')}
              step={0.01}
            />
          </Form.Item>
        </div>

        <Form.Item name="thousand_separator" style={{ display: 'none' }}>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item name="decimal_separator" style={{ display: 'none' }}>
          <Input type="hidden" />
        </Form.Item>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">{__('Format Preview')}</div>
          <div className="font-mono text-lg">
            {selectedCurrency && currencyStaticData[selectedCurrency] && (
              <span>
                {symbol || currencyStaticData[selectedCurrency].symbol[0]}{' '}
                {getPreviewByFormatKey(thousandSeparatorSelector, decimalPlaces)}
              </span>
            )}
          </div>
        </div>
      </If>
    </Form>
  )
}
