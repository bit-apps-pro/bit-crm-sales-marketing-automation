import useBusinessSettings from '@pages/general-settings/internal/business-settings/data/use-business-settings'
import { type BusinessSettings } from '@pages/general-settings/internal/business-settings/shared/types'

import { type InvoicePreviewData } from '../shared/invoice-preview-types'
import InvoiceInfoPreview from './invoice-info-preview'
import InvoiceLineItemsPreview from './invoice-line-items-preview'
import InvoiceSectionsPreview from './invoice-sections-preview'
import InvoiceSenderReceiverPreview from './invoice-sender-receiver-preview'

interface InvoicePreviewProps {
  businessSettings?: BusinessSettings
  data: InvoicePreviewData
  termName?: string
}

export default function InvoicePreview({
  businessSettings: businessSettingsProp,
  data,
  termName
}: InvoicePreviewProps) {
  // The public invoice page passes settings/term in (its viewers cannot call
  // the capability-gated admin endpoints); admin pages keep using the hook.
  const { businessSettings: fetchedBusinessSettings } = useBusinessSettings()
  const businessSettings = businessSettingsProp ?? fetchedBusinessSettings

  return (
    <div className="min-h-[1123px] space-y-5 rounded-lg border border-solid border-[#EBEAFF] bg-white p-16 dark:border-neutral-700 dark:bg-neutral-900">
      <InvoiceInfoPreview data={data} logoUrl={businessSettings?.logo_url} termName={termName} />
      <InvoiceSenderReceiverPreview
        businessSettings={businessSettings}
        contact={data.contact}
        deal={data.deal}
      />
      <InvoiceSectionsPreview sectionNotes={data.topSectionNotes} />
      <InvoiceLineItemsPreview
        currencyData={data.currencyData}
        grossDiscountAmount={data.grossDiscountAmount}
        grossDiscountType={data.grossDiscountType}
        lineItems={data.lineItems}
        taxOption={data.taxOption}
      />
      <InvoiceSectionsPreview sectionNotes={data.bottomSectionNotes} />
    </div>
  )
}
