import { __ } from '@common/helpers/i18nWrap'
import { ProExportListAlert } from '@utilities/pro-feature-alert'

export default function Exports() {
  return <ProExportListAlert featureName={__('Export History')} />
}
