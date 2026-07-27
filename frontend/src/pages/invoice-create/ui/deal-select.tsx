import { MODULES } from '@common/constants/modules'
import { renderFullAddress, renderFullName } from '@common/helpers/entity-helpers'
import { __ } from '@common/helpers/i18nWrap'
import LookupFieldSelect from '@features/lookup-field-select'
import { Button, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { LuPlus } from 'react-icons/lu'
import { Link, useSearchParams } from 'react-router'

import useDealContactCurrency from '../data/use-deal-contact-currency'
import {
  useContactInformationSelect,
  useDealInformationSelect,
  useInvoiceCreateStoreActions
} from '../state/use-invoice-create-store'

export default function DealSelect({ mode }: { mode: string }) {
  const [searchParams] = useSearchParams()
  const [dealId, setDealId] = useState<number | string>(() =>
    mode === 'edit' ? '' : (searchParams.get('dealId') ?? '')
  )
  const { clearStore, setContactInformation, setCurrencyData, setDealInformation } =
    useInvoiceCreateStoreActions()
  const { dealContactCurrency } = useDealContactCurrency(Number(dealId))

  const dealInformation = useDealInformationSelect()
  const contactInformation = useContactInformationSelect()

  useEffect(() => {
    if (dealContactCurrency) {
      setDealInformation({ ...dealContactCurrency.data.deal, isDealSelected: true })
      setCurrencyData(dealContactCurrency.data.currencyData)
      setContactInformation(dealContactCurrency.data.contact)
    }
  }, [dealContactCurrency, setContactInformation, setCurrencyData, setDealInformation])

  return (
    <div className="flex h-full flex-col space-y-4 rounded-lg border border-solid border-[#EBEAFF] p-5 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-10">
        <Typography.Text className="flex h-10 items-center whitespace-nowrap" strong>
          {__('Select a deal')}
        </Typography.Text>
        <div className="min-w-0 flex-1 pb-6">
          <LookupFieldSelect
            className="w-full"
            disabled={mode === 'edit'}
            onChange={value => {
              if (value === undefined) {
                clearStore()
                setDealId('')
              } else {
                setDealId(value)
              }
            }}
            relatedModule={MODULES.DEAL}
            showAddNew={false}
            value={dealInformation.id}
          />
        </div>
      </div>
      {dealInformation.isDealSelected ? (
        <div className="flex-1 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:bg-neutral-900">
          <div>
            <Typography.Text className="text-xs text-gray-500">
              {__('Contact Information')}
            </Typography.Text>
          </div>
          <div className="space-y-1">
            <Typography.Text className="block" strong>
              {renderFullName(
                contactInformation?.title,
                contactInformation?.first_name,
                contactInformation?.last_name
              )}
            </Typography.Text>
            <Typography.Text className="block">{dealInformation?.email}</Typography.Text>
            <Typography.Text>
              {renderFullAddress(
                contactInformation?.billing_address_line_1,
                contactInformation?.billing_address_line_2,
                contactInformation?.billing_city,
                contactInformation?.billing_county,
                contactInformation?.billing_state,
                contactInformation?.billing_zip,
                contactInformation?.billing_country
              )}
            </Typography.Text>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <Link target="_blank" to="/deals/create">
            <Button
              className="h-full w-full py-12"
              icon={<LuPlus size={16} />}
              size="large"
              type="dashed"
            >
              {__('Create New Deal')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
