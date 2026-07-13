export const SETTING_KEY = {
  DEAL_FIELDS_ORDER: 'deal_fields_order',
  DEAL_FIELDS_SETTINGS: 'deal_fields_settings',
  DEAL_TABLE_COLUMNS_ORDER: 'deal_table_columns_order',
  DEAL_TABLE_VISIBLE_COLUMNS: 'deal_table_visible_columns'
} as const

export type SettingKeyType = (typeof SETTING_KEY)[keyof typeof SETTING_KEY]
