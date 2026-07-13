import { __ } from '@common/helpers/i18nWrap'
import { Button, Card, Typography } from 'antd'
import { useMemo } from 'react'
import { LuPenLine } from 'react-icons/lu'

import { generateCurrencyFormatPreview } from '../shared/common-functions'
import { type CurrencyItemType } from '../shared/currency-types'
import { useCurrencyActions } from '../state/use-currency-store'

const getLabel = (currency?: [] | CurrencyItemType) => {
  if (!currency || Array.isArray(currency) || !('label' in currency)) {
    return ''
  }

  return currency.label
}

export default function HomeCurrencyCard({
  homeCurrency
}: {
  homeCurrency: [] | CurrencyItemType | undefined
}) {
  const { setHomeCurrencyEditModalOpen, setSelectedCurrency } = useCurrencyActions()

  const homeCurrencyFormat = useMemo(() => {
    if (homeCurrency && !Array.isArray(homeCurrency) && Object.keys(homeCurrency).length > 0) {
      return generateCurrencyFormatPreview(homeCurrency, 1_234_567.89)
    }

    return ''
  }, [homeCurrency])

  const handleEdit = () => {
    if (homeCurrency && !Array.isArray(homeCurrency)) {
      setSelectedCurrency(homeCurrency)
      setHomeCurrencyEditModalOpen(true)
    }
  }

  return (
    <Card className="mt-6 w-fit border border-solid border-[#EBEAFF] bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center gap-4">
        <div>
          <Typography.Text>{__('Home Currency: ')}</Typography.Text>{' '}
          <Typography.Text strong>{getLabel(homeCurrency)}</Typography.Text>
        </div>
        <div>
          <Typography.Text>{__('Format Preview: ')}</Typography.Text>{' '}
          <Typography.Text strong>{homeCurrencyFormat}</Typography.Text>
        </div>
        <Button
          aria-label={__('Edit home currency')}
          icon={<LuPenLine />}
          onClick={handleEdit}
          size="small"
          type="text"
        />
      </div>
    </Card>
  )
}
