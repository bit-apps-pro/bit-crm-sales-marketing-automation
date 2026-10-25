import { __ } from '@common/helpers/i18nWrap'
import { ProEntitySettingsAlert } from '@utilities/pro-feature-alert'

export default function TaxSettings() {
  const TAX_FIELDS = [
    { label: __('Tax Name'), type: __('Text') },
    { label: __('Rate'), type: __('Number') },
    { label: __('Tax Class'), type: __('Dropdown') },
    { label: __('Country'), type: __('Dropdown') },
    { label: __('State'), type: __('Dropdown') }
  ]

  return <ProEntitySettingsAlert featureName={__('Tax Settings')} fields={TAX_FIELDS} />
}
