import { __ } from '@common/helpers/i18nWrap'
import { ProBanner } from '@utilities/pro-feature-alert'

/** Free variant: quotes are a pro feature. */
export default function DealQuotes() {
  return <ProBanner className="my-6" featureName={__('Quotes')} />
}
