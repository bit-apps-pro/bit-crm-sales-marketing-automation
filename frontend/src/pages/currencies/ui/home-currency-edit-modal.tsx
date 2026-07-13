import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Modal } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect } from 'react'

import useUpdateHomeCurrency from '../data/use-update-home-currency'
import CurrencyForm from '../internal/currency-form'
import { getFormatKeyByCurrency } from '../shared/common-functions'
import { FORMAT_MAPPINGS } from '../shared/constants'
import {
  useCurrencyActions,
  useIsHomeCurrencyEditModalOpen,
  useSelectedCurrency
} from '../state/use-currency-store'

export default function HomeCurrencyEditModal() {
  const [form] = useForm()
  const { isUpdatingHomeCurrency, updateHomeCurrency } = useUpdateHomeCurrency(form)
  const isHomeCurrencyEditModalOpen = useIsHomeCurrencyEditModalOpen()
  const selectedCurrency = useSelectedCurrency()
  const { setHomeCurrencyEditModalOpen, setSelectedCurrency } = useCurrencyActions()

  useEffect(() => {
    if (selectedCurrency && isHomeCurrencyEditModalOpen) {
      const formatKey = getFormatKeyByCurrency(selectedCurrency)

      form.setFieldsValue({
        currency: selectedCurrency.currency,
        decimal_places: selectedCurrency.decimal_places,
        decimal_separator: selectedCurrency.decimal_separator,
        exchange_rate: selectedCurrency.exchange_rate
          ? Number.parseFloat(selectedCurrency.exchange_rate)
          : undefined,
        symbol: selectedCurrency.symbol,
        thousand_separator: selectedCurrency.thousand_separator,
        thousand_separator_selector: formatKey
      })
    }
  }, [selectedCurrency, isHomeCurrencyEditModalOpen, form])

  const handleCancel = () => {
    form.resetFields()
    setHomeCurrencyEditModalOpen(false)
    setSelectedCurrency(undefined)
  }

  const handleSubmit = async () => {
    if (!selectedCurrency) return

    const values = await form.validateFields()
    values.decimal_places = Number(values.decimal_places)

    const formatValue = FORMAT_MAPPINGS[values.thousand_separator_selector]

    if (!formatValue) return

    values.thousand_separator = formatValue.thousand_separator
    values.decimal_separator = formatValue.decimal_separator
    values.numeral_system = formatValue.numeral_system

    await updateHomeCurrency(values)
    form.resetFields()
    setHomeCurrencyEditModalOpen(false)
    setSelectedCurrency(undefined)
  }

  return (
    <Modal
      cancelButtonProps={{ className: 'rounded-full' }}
      confirmLoading={isUpdatingHomeCurrency}
      destroyOnHidden
      okButtonProps={{ 'aria-label': 'Home currency update button', className: 'rounded-full' }}
      okText={__('Update')}
      onCancel={handleCancel}
      onOk={handleSubmit}
      open={isHomeCurrencyEditModalOpen}
      title={__('Edit Home Currency')}
      width={600}
    >
      <If conditions={isHomeCurrencyEditModalOpen && selectedCurrency}>
        <CurrencyForm form={form} isEdit isHome />
      </If>
    </Modal>
  )
}
