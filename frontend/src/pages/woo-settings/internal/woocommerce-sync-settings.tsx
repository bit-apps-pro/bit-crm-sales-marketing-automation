import { __ } from '@common/helpers/i18nWrap'
import If from '@utilities/If'
import { Form, Input, Skeleton, Switch, Typography } from 'antd'
import { useEffect, useRef } from 'react'
import { LuLoader } from 'react-icons/lu'

import useUpsertWcSyncSettings from '../data/use-upsert-wc-sync-settings'
import useWcSyncSettings from '../data/use-wc-sync-settings'
import { type WooCommerceIntegrationSettings } from '../shared/types'

const { Text, Title } = Typography

const DEFAULT_VALUES: WooCommerceIntegrationSettings = {
  coupon_tag_prefix: 'Coupon:',
  include_coupon_as_tag: true,
  product_tag_prefix: 'Product:',
  sync_enabled: false,
  tag_contact: true,
  use_coupon_tag_prefix: true,
  use_product_tag_prefix: false
}

interface SettingRowProps {
  control: React.ReactNode
  description: string
  disabled?: boolean
  title: string
}

function SettingRow({ control, description, disabled, title }: SettingRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-6 border-0 border-b border-solid border-[#E5E3FE] px-6 py-4 last:border-b-0 dark:border-neutral-700 ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="flex-1">
        <Text className="block font-medium">{title}</Text>
        <Text className="block text-sm" type="secondary">
          {description}
        </Text>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}

interface Props {
  settingKey: string
}

export default function WoocommerceSyncSettings({ settingKey }: Props) {
  const [form] = Form.useForm()
  const { isSettingsLoading, isWooPluginActive, settings } = useWcSyncSettings(settingKey)
  const { isSaving, saveSettings } = useUpsertWcSyncSettings(settingKey)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

  const syncEnabled = Form.useWatch('sync_enabled', form) && isWooPluginActive
  const tagContact = Form.useWatch('tag_contact', form)
  const includeCoupon = Form.useWatch('include_coupon_as_tag', form)
  const useProductPrefix = Form.useWatch('use_product_tag_prefix', form)
  const useCouponPrefix = Form.useWatch('use_coupon_tag_prefix', form)

  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings)
    }
  }, [settings, form])

  useEffect(
    () => () => {
      clearTimeout(saveTimer.current)
    },
    []
  )

  const handleValuesChange = () => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      const values = form.getFieldsValue() as WooCommerceIntegrationSettings
      await saveSettings(values)
    }, 1000)
  }

  if (isSettingsLoading) {
    return (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    )
  }

  return (
    <Form
      form={form}
      initialValues={DEFAULT_VALUES}
      layout="vertical"
      onValuesChange={handleValuesChange}
    >
      <div className="rounded-md border border-solid border-[#E5E3FE] dark:border-neutral-700">
        <div className="flex items-center border-0 border-b border-solid border-[#E5E3FE] px-6 py-3 dark:border-neutral-700">
          <Title className="mb-0" level={5}>
            {__('WooCommerce Sync')}
          </Title>
          <If conditions={isSaving}>
            <div className="ml-2 flex items-center">
              <LuLoader />
              <Text className="ml-2 text-xs" type="secondary">
                {__('Saving...')}
              </Text>
            </div>
          </If>
        </div>

        <SettingRow
          control={
            <Form.Item
              className="mb-0"
              getValueProps={value => ({ checked: isWooPluginActive ? Boolean(value) : false })}
              name="sync_enabled"
              valuePropName="checked"
            >
              <Switch disabled={!isWooPluginActive} />
            </Form.Item>
          }
          description={
            isWooPluginActive
              ? __('Automatically sync contacts from WooCommerce orders into the CRM.')
              : __('WooCommerce is not active. Install and activate WooCommerce to enable sync.')
          }
          disabled={!isWooPluginActive}
          title={__('Enable WooCommerce Sync')}
        />

        <SettingRow
          control={
            <Form.Item className="mb-0" name="tag_contact" valuePropName="checked">
              <Switch disabled={!syncEnabled} />
            </Form.Item>
          }
          description={__('Tag your contacts with the name of products they purchased.')}
          disabled={!syncEnabled}
          title={__('Tag Contact')}
        />

        <SettingRow
          control={
            <div className="flex items-center gap-2">
              <Form.Item className="mb-0" name="use_product_tag_prefix" valuePropName="checked">
                <Switch disabled={!syncEnabled || !tagContact} />
              </Form.Item>
              {useProductPrefix && (
                <Form.Item className="mb-0" name="product_tag_prefix">
                  <Input
                    disabled={!syncEnabled || !tagContact}
                    placeholder={__('e.g. Product: ')}
                    style={{ width: 150 }}
                  />
                </Form.Item>
              )}
            </div>
          }
          description={__('Enter a tag prefix for product tags (e.g. Product: )')}
          disabled={!syncEnabled || !tagContact}
          title={__('Product tag prefix')}
        />

        <SettingRow
          control={
            <Form.Item className="mb-0" name="include_coupon_as_tag" valuePropName="checked">
              <Switch disabled={!syncEnabled} />
            </Form.Item>
          }
          description={__('Include coupon codes as tags on the contact.')}
          disabled={!syncEnabled}
          title={__('Include Coupon as Tag')}
        />

        <SettingRow
          control={
            <div className="flex items-center gap-2">
              <Form.Item className="mb-0" name="use_coupon_tag_prefix" valuePropName="checked">
                <Switch disabled={!syncEnabled || !includeCoupon} />
              </Form.Item>
              {useCouponPrefix && (
                <Form.Item className="mb-0" name="coupon_tag_prefix">
                  <Input
                    disabled={!syncEnabled || !includeCoupon}
                    placeholder={__('e.g. Coupon: ')}
                    style={{ width: 150 }}
                  />
                </Form.Item>
              )}
            </div>
          }
          description={__('Enter a tag prefix for coupon tags (e.g. Coupon: )')}
          disabled={!syncEnabled || !includeCoupon}
          title={__('Coupon tag prefix')}
        />
      </div>
    </Form>
  )
}
