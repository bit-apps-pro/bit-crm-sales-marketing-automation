import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Button, Typography } from 'antd'
import { LuPlus } from 'react-icons/lu'

import useCurrencies from './data/use-currencies'
import CurrencySetupHome from './internal/currency-setup-home'
import CurrencySkeleton from './internal/currency-skeleton'
import HomeCurrencyCard from './internal/home-currency-card'
import { useCurrencyActions } from './state/use-currency-store'
import CurrenciesTable from './ui/currencies-table'
import CurrencyCreateModal from './ui/currency-create-modal'
import CurrencyEditModal from './ui/currency-edit-modal'
import HomeCurrencyEditModal from './ui/home-currency-edit-modal'
import HomeCurrencySetupModal from './ui/home-currency-setup-modal'

export default function Currencies() {
  const { currencies, homeCurrency, isCurrenciesPending, refetchCurrencies } = useCurrencies()
  const { setCreateModalOpen } = useCurrencyActions()

  const hasHomeCurrency = homeCurrency && Object.keys(homeCurrency).length > 0

  if (isCurrenciesPending) {
    return (
      <div>
        <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-[#3F3A86]">
          <Typography.Title className="mb-0" level={2}>
            {__('Currencies')}
          </Typography.Title>
        </div>
        <div className="mx-6 my-2">
          <CurrencySkeleton />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="border-0 border-b border-solid border-[#E5E3FE] px-4 py-2 dark:border-[#3F3A86]">
        <Typography.Title className="mb-0" level={2}>
          {__('Currencies')}
        </Typography.Title>
      </div>

      <div className="mx-6 my-2">
        <If conditions={!hasHomeCurrency}>
          <CurrencySetupHome />
        </If>

        <If conditions={hasHomeCurrency}>
          <HomeCurrencyCard homeCurrency={homeCurrency} />

          <div className="mt-4 rounded-t-md border border-b-0 border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex gap-2 p-2">
              <Typography.Title level={4}>{__('Other Currencies')}</Typography.Title>
              <Button
                className="rounded-full"
                icon={<LuPlus />}
                onClick={() => setCreateModalOpen(true)}
                type="primary"
              >
                {__('Add Currency')}
              </Button>
            </div>

            <CurrenciesTable currencies={currencies} refetchCurrencies={refetchCurrencies} />
          </div>

          <CurrencyCreateModal />
          <CurrencyEditModal />
          <HomeCurrencyEditModal />
        </If>

        <If conditions={!hasHomeCurrency}>
          <HomeCurrencySetupModal />
        </If>
      </div>
    </div>
  )
}
