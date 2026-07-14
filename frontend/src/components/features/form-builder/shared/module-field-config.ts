import { MODULES } from '@common/constants/modules'

export interface ModuleFieldConfig {
  columnSettingsKey: string
  endPoint: string
  orderKey: string
  queryKeys: string[]
  settingsKey: string
  tableQueryKeys: string[]
}

export const MODULE_FIELD_CONFIG: Record<string, ModuleFieldConfig> = {
  [MODULES.COMPANY]: {
    columnSettingsKey: 'company_columns_settings',
    endPoint: 'companies/fields',
    orderKey: 'company_fields_order',
    queryKeys: ['company', 'fields'],
    settingsKey: 'company_fields_settings',
    tableQueryKeys: ['company', 'table-fields']
  },
  [MODULES.CONTACT]: {
    columnSettingsKey: 'contact_columns_settings',
    endPoint: 'contacts/fields',
    orderKey: 'contact_fields_order',
    queryKeys: ['contact', 'fields'],
    settingsKey: 'contact_fields_settings',
    tableQueryKeys: ['contact', 'table-fields']
  },
  [MODULES.DEAL]: {
    columnSettingsKey: 'deal_columns_settings',
    endPoint: 'deals/fields',
    orderKey: 'deal_fields_order',
    queryKeys: ['deals', 'fields'],
    settingsKey: 'deal_fields_settings',
    tableQueryKeys: ['deals', 'table-fields']
  },
  [MODULES.LEAD]: {
    columnSettingsKey: 'lead_columns_settings',
    endPoint: 'leads/fields',
    orderKey: 'lead_fields_order',
    queryKeys: ['lead', 'fields'],
    settingsKey: 'lead_fields_settings',
    tableQueryKeys: ['lead', 'table-fields']
  }
}
