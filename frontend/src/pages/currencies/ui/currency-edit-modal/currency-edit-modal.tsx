import { __ } from '@common/helpers/i18nWrap'
import { useCurrencyActions, useIsEditModalOpen } from '@pages/currencies/state/use-currency-store'
import { ProBanner } from '@utilities/pro-feature-alert'
import { Modal } from 'antd'

export default function CurrencyAddModal() {
  const isEditModalOpen = useIsEditModalOpen()
  const { setEditModalOpen } = useCurrencyActions()

  return (
    <Modal
      centered
      footer={false}
      onCancel={() => setEditModalOpen(false)}
      open={isEditModalOpen}
      title={__('Edit Currency')}
    >
      <ProBanner featureName={__('Edit Currency')} />
    </Modal>
  )
}
