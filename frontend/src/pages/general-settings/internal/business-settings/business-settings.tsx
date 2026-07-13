import CAPABILITIES from '@common/constants/capabilities'
import NotifyContext from '@common/context/NotifyContext'
import { checkCapability } from '@common/helpers/capabilityHelper'
import { __ } from '@common/helpers/i18nWrap'
import { Form } from 'antd'
import { useContext, useEffect } from 'react'

import useBusinessSettings from './data/use-business-settings'
import useStoreBusinessSettings from './data/use-store-business-settings'
import useUpdateBusinessSettings from './data/use-update-business-settings'
import BusinessSettingsForm from './ui/business-settings-form'
import BusinessSettingsSkeleton from './ui/business-settings-skeleton'

export default function BusinessSettings() {
  const [form] = Form.useForm()
  const { businessSettingsUpdating, updateBusinessSettings } = useUpdateBusinessSettings(form)
  const { businessSettingsInserting, insertBusinessSettings } = useStoreBusinessSettings(form)
  const { businessSettings, isBusinessSettingsPending } = useBusinessSettings()
  const { messageApi } = useContext(NotifyContext)

  useEffect(() => {
    if (!isBusinessSettingsPending && businessSettings) {
      form.setFieldsValue(businessSettings)
    }
  }, [businessSettings, isBusinessSettingsPending, form])

  if (isBusinessSettingsPending) {
    return <BusinessSettingsSkeleton />
  }

  const handleFormSubmit = async () => {
    const data = await form.validateFields()
    if (!checkCapability(CAPABILITIES.SETTING.BUSINESS_SETTINGS)) {
      messageApi?.error(__('You do not have permission to update business settings.'))
      return
    }
    await (businessSettings ? updateBusinessSettings(data) : insertBusinessSettings(data))
  }

  return (
    <BusinessSettingsForm
      form={form}
      handleFormSubmit={handleFormSubmit}
      isLoading={businessSettingsUpdating || businessSettingsInserting}
    />
  )
}
