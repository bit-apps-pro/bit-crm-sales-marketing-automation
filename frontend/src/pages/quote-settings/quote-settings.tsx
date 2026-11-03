import { __ } from '@common/helpers/i18nWrap'
import { ProEntitySettingsAlert } from '@utilities/pro-feature-alert'

export default function QuoteSettings() {
  const QUOTE_FIELDS = [
    { label: __('Quote Prefix'), type: __('Text') },
    { label: __('Default validity (days)'), type: __('Number') },
    { label: __('Default notes and terms'), type: __('Text') }
  ]

  return <ProEntitySettingsAlert featureName={__('Quote Settings')} fields={QUOTE_FIELDS} />
}
