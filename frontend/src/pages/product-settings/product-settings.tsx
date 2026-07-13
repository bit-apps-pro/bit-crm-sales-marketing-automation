import { __ } from '@common/helpers/i18nWrap'
import { ProEntitySettingsAlert } from '@utilities/pro-feature-alert'

export default function ProductSettings() {
  const PRODUCT_FIELDS = [
    { label: __('Product Name'), type: __('Text') },
    { label: __('Product Code/SKU'), type: __('Text') },
    { label: __('Product Type'), type: __('Dropdown') },
    { label: __('Manufacturer / Brand'), type: __('Dropdown') },
    { label: __('Description'), type: __('Textarea') },
    { label: __('Unit Price'), type: __('Number') },
    { label: __('Cost Price'), type: __('Number') },
    { label: __('Tax Rate'), type: __('Number') },
    { label: __('Status'), type: __('Dropdown') }
  ]

  return <ProEntitySettingsAlert featureName={__('Product Settings')} fields={PRODUCT_FIELDS} />
}
