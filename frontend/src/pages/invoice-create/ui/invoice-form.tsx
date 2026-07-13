import { __ } from '@common/helpers/i18nWrap'
import ProductLineItems from '@features/product-line-items'
import useBusinessSettings from '@pages/general-settings/internal/business-settings/data/use-business-settings'
import If from '@utilities/If'
import { Alert, type FormInstance, Typography } from 'antd'

import { type InvoiceFormType } from '../shared/invoice-create-types'
import {
  useDealInformationSelect,
  useInvoiceCreateStoreActions,
  useInvoiceCurrencyDataSelect,
  useInvoiceLineItemsSelect
} from '../state/use-invoice-create-store'
import BottomSection from './bottom-section'
import BusinessInformation from './business-information'
import DealSelect from './deal-select'
import InvoiceInformation from './invoice-information'
import InvoiceLogo from './invoice-logo'
import TopSection from './top-section'

type InvoiceFormMode = 'create' | 'edit'

interface InvoiceFormProps {
  form: FormInstance<InvoiceFormType>
  mode: InvoiceFormMode
}

export default function InvoiceForm({ form, mode }: InvoiceFormProps) {
  const invoiceLineItems = useInvoiceLineItemsSelect()
  const { setInvoiceLineItems } = useInvoiceCreateStoreActions()
  const currencyData = useInvoiceCurrencyDataSelect()
  const dealInformation = useDealInformationSelect()
  const { businessSettings } = useBusinessSettings()

  return (
    <div className="space-y-6">
      <Typography.Title className="mb-3 text-center font-semibold">
        {mode === 'create' ? __('INVOICE') : __('EDIT INVOICE')}
      </Typography.Title>
      <div className="grid grid-cols-2 gap-10">
        <InvoiceLogo logo={businessSettings?.logo_url} />
        <InvoiceInformation form={form} />
        <BusinessInformation businessSettings={businessSettings} />
        <DealSelect mode={mode} />
      </div>
      <TopSection mode={mode} />
      <fieldset
        className={
          !dealInformation.isDealSelected && mode === 'create' ? 'pointer-events-none' : undefined
        }
        disabled={!dealInformation.isDealSelected && mode === 'create'}
      >
        <If conditions={!dealInformation.isDealSelected && mode === 'create'}>
          <Alert
            message={__('Please select a deal first to add product line items')}
            showIcon
            type="warning"
          />
        </If>
        {currencyData && (
          <ProductLineItems
            allowCustomSource
            currencyData={currencyData}
            localLineItems={invoiceLineItems}
            setLocalLineItems={setInvoiceLineItems}
          />
        )}
      </fieldset>
      <BottomSection mode={mode} />
    </div>
  )
}
