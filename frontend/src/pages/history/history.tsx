import { __ } from '@common/helpers/i18nWrap'
import { ProHistoryAlert } from '@utilities/pro-feature-alert'

export default function History() {
  return <ProHistoryAlert featureName={__('History')} />
}
