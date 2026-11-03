import { __ } from '@common/helpers/i18nWrap'
import { ProEntitiesAlert } from '@utilities/pro-feature-alert'

export default function Quotes() {
  const QUOTE_COLUMNS = [
    __('Quote Number'),
    __('Deal Name'),
    __('Status'),
    __('Amount'),
    __('Quote Date'),
    __('Valid Until'),
    __('Actions')
  ]

  return <ProEntitiesAlert columns={QUOTE_COLUMNS} featureName={__('Quotes')} />
}
