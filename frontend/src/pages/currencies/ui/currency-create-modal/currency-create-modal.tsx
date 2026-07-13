import { __ } from '@common/helpers/i18nWrap'
import { useCurrencyActions, useIsCreateModalOpen } from '@pages/currencies/state/use-currency-store'
import { ProBanner } from '@utilities/pro-feature-alert'
import { Modal } from 'antd'

export default function CurrencyAddModal() {
  const isCreateModalOpen = useIsCreateModalOpen()
  const { setCreateModalOpen } = useCurrencyActions()

  return (
    <Modal
      centered
      footer={false}
      onCancel={() => setCreateModalOpen(false)}
      open={isCreateModalOpen}
      title={__('Add Currency')}
    >
      <ProBanner featureName={__('Multiple Currencies')} />
    </Modal>
  )
}
