import { __ } from '@common/helpers/i18nWrap'
import { ProCalendarIntegrationAlert } from '@utilities/pro-feature-alert'

export default function CalendarIntegration() {
  return <ProCalendarIntegrationAlert featureName={__('Calendar Integration')} />
}
