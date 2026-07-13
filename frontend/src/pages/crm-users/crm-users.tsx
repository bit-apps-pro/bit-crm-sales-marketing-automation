import { __ } from '@common/helpers/i18nWrap'
import { ProCrmUsersAlert } from '@utilities/pro-feature-alert'

export default function CrmUsers() {
  return <ProCrmUsersAlert featureName={__('CRM Users')} />
}
