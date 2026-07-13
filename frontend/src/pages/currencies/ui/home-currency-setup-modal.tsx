import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Alert, Button, Modal, Popconfirm } from 'antd'
import { useForm } from 'antd/es/form/Form'

import useSetupHomeCurrency from '../data/use-setup-home-currency'
import CurrencyForm from '../internal/currency-form'
import { FORMAT_MAPPINGS } from '../shared/constants'
import { useCurrencyActions, useIsHomeCurrencySetupModalOpen } from '../state/use-currency-store'

export default function HomeCurrencySetupModal() {
  const [form] = useForm()
  const { isSettingUpHomeCurrency, setupHomeCurrency } = useSetupHomeCurrency(form)
  const isHomeCurrencySetupModalOpen = useIsHomeCurrencySetupModalOpen()
  const { setHomeCurrencySetupModalOpen } = useCurrencyActions()

  const handleCancel = () => {
    form.resetFields()
    setHomeCurrencySetupModalOpen(false)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    values.decimal_places = Number(values.decimal_places)

    const formatValue = FORMAT_MAPPINGS[values.thousand_separator_selector]

    if (!formatValue) return

    values.thousand_separator = formatValue.thousand_separator
    values.decimal_separator = formatValue.decimal_separator
    values.numeral_system = formatValue.numeral_system

    await setupHomeCurrency(values)
    form.resetFields()
    setHomeCurrencySetupModalOpen(false)
  }

  return (
    <Modal
      destroyOnHidden
      footer={false}
      onCancel={handleCancel}
      open={isHomeCurrencySetupModalOpen}
      title={__('Setup Home Currency')}
      width={600}
    >
      <If conditions={isHomeCurrencySetupModalOpen}>
        <CurrencyForm defaultCurrency="USD" form={form} isHome />
        <Alert
          className="mt-2"
          message={__('Home currency can only be set once and cannot be changed later.')}
          showIcon
          type="warning"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button className="rounded-full" disabled={isSettingUpHomeCurrency} onClick={handleCancel}>
            {__('Cancel')}
          </Button>
          <Popconfirm
            cancelText={__('No')}
            description={__('Home currency can only be set once and cannot be changed later.')}
            okText={__('Yes')}
            onConfirm={handleSubmit}
            placement="topRight"
            title={__('Are you sure you want to setup this home currency?')}
          >
            <Button className="rounded-full" disabled={isSettingUpHomeCurrency} type="primary">
              {__('Setup')}
            </Button>
          </Popconfirm>
        </div>
      </If>
    </Modal>
  )
}
