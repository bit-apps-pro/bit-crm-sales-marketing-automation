import { __ } from '@common/helpers/i18nWrap'
import { Button, Result, Typography } from 'antd'
import { LuBadgeDollarSign, LuSettings } from 'react-icons/lu'

import { useCurrencyActions } from '../state/use-currency-store'

export default function CurrencySetupHome() {
  const { setHomeCurrencySetupModalOpen } = useCurrencyActions()

  return (
    <Result
      extra={[
        <Button
          className="rounded-full"
          icon={<LuSettings />}
          key="setup"
          onClick={() => setHomeCurrencySetupModalOpen(true)}
          size="large"
          type="primary"
        >
          {__('Setup Home Currency')}
        </Button>
      ]}
      icon={<LuBadgeDollarSign className="text-6xl text-gray-400 dark:text-gray-500" />}
      status="info"
      subTitle={
        <div>
          <Typography.Text type="secondary">
            {__(
              'Set up your home currency to start managing multiple currencies in your CRM. This will be used as the base currency for all calculations.'
            )}
          </Typography.Text>
          <br />
          <Typography.Text mark type="secondary">
            {__('Default home currency is USD if not set. Note that you can only change this once.')}
          </Typography.Text>
        </div>
      }
      title={__('Currency Management')}
    />
  )
}
