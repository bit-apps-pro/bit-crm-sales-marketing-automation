const CAPABILITIES = {
  ACTIVITY: {
    CREATE: 'bit_crm_activity_create',
    DELETE: 'bit_crm_activity_delete',
    UPDATE: 'bit_crm_activity_update',
    VIEW: 'bit_crm_activity_view'
  },
  ADMINISTRATOR: 'administrator',
  ATTACHMENT: {
    CREATE: 'bit_crm_attachment_create',
    DELETE: 'bit_crm_attachment_delete',
    VIEW: 'bit_crm_attachment_view'
  },
  COMPANY: {
    CREATE: 'bit_crm_company_create',
    DELETE: 'bit_crm_company_delete',
    EXPORT: 'bit_crm_company_export',
    IMPORT: 'bit_crm_company_import',
    MENU: 'bit_crm_company_menu',
    UPDATE: 'bit_crm_company_update',
    VIEW: 'bit_crm_company_view'
  },
  CONTACT: {
    CREATE: 'bit_crm_contact_create',
    DELETE: 'bit_crm_contact_delete',
    EXPORT: 'bit_crm_contact_export',
    IMPORT: 'bit_crm_contact_import',
    MENU: 'bit_crm_contact_menu',
    UPDATE: 'bit_crm_contact_update',
    VIEW: 'bit_crm_contact_view'
  },
  DASHBOARD: 'bit_crm_dashboard',
  DEAL: {
    CREATE: 'bit_crm_deal_create',
    DELETE: 'bit_crm_deal_delete',
    EMAILS: 'bit_crm_deal_emails',
    MENU: 'bit_crm_deal_menu',
    UPDATE: 'bit_crm_deal_update',
    VIEW: 'bit_crm_deal_view'
  },
  GENERAL_SETTINGS: 'bit_crm_general_settings',
  HISTORY: {
    MENU: 'bit_crm_history_menu',
    READ: 'bit_crm_history_read'
  },
  IMAP: {
    CREATE: 'bit_crm_imap_settings_create',
    DELETE: 'bit_crm_imap_settings_delete',
    MENU: 'bit_crm_imap_settings_menu',
    READ: 'bit_crm_imap_settings_read',
    UPDATE: 'bit_crm_imap_settings_update'
  },
  INVOICE: {
    CREATE: 'bit_crm_invoice_create',
    DELETE: 'bit_crm_invoice_delete',
    MENU: 'bit_crm_invoice_menu',
    UPDATE: 'bit_crm_invoice_update',
    VIEW: 'bit_crm_invoice_view'
  },
  LEAD: {
    CREATE: 'bit_crm_lead_create',
    DELETE: 'bit_crm_lead_delete',
    EXPORT: 'bit_crm_lead_export',
    IMPORT: 'bit_crm_lead_import',
    MENU: 'bit_crm_lead_menu',
    SETTINGS: 'bit_crm_lead_settings',
    UPDATE: 'bit_crm_lead_update',
    VIEW: 'bit_crm_lead_view'
  },
  LINK: {
    CREATE: 'bit_crm_link_create',
    DELETE: 'bit_crm_link_delete',
    UPDATE: 'bit_crm_link_update',
    VIEW: 'bit_crm_link_view'
  },
  NOTE: {
    CREATE: 'bit_crm_note_create',
    DELETE: 'bit_crm_note_delete',
    UPDATE: 'bit_crm_note_update',
    VIEW: 'bit_crm_note_view'
  },
  OTHERS: {
    History: 'bit_crm_history_view'
  },
  PRODUCT: {
    CREATE: 'bit_crm_product_create',
    DELETE: 'bit_crm_product_delete',
    MENU: 'bit_crm_product_menu',
    UPDATE: 'bit_crm_product_update',
    VIEW: 'bit_crm_product_view'
  },
  SETTING: {
    BUSINESS_SETTINGS: 'bit_crm_setting_business',
    COMPANY: 'bit_crm_setting_company',
    CONTACT: 'bit_crm_setting_contact',
    CURRENCY: 'bit_crm_setting_currency',
    DATA_MANAGEMENT: 'bit_crm_setting_data_management',
    DEAL: 'bit_crm_setting_deal',
    GENERAL: 'bit_crm_setting_general',
    HISTORY: 'bit_crm_setting_history',
    IMAP: 'bit_crm_setting_imap',
    INTEGRATION: 'bit_crm_setting_integration',
    INVOICE: 'bit_crm_setting_invoice',
    LEAD: 'bit_crm_setting_lead',
    MENU: 'bit_crm_setting_menu',
    PORTAL_SETTINGS: 'bit_crm_setting_portal',
    PRODUCT: 'bit_crm_setting_product',
    SMTP: 'bit_crm_setting_smtp',
    USER: 'bit_crm_setting_crm_user',
    WORKFLOW: 'bit_crm_setting_workflow'
  },
  TAG: {
    CREATE: 'bit_crm_tag_create',
    DELETE: 'bit_crm_tag_delete',
    MENU: 'bit_crm_tag_menu',
    UPDATE: 'bit_crm_tag_update',
    VIEW: 'bit_crm_tag_view'
  },
  WORKFLOW: {
    CREATE: 'bit_crm_workflow_create',
    DELETE: 'bit_crm_workflow_delete',
    MENU: 'bit_crm_workflow_menu',
    UPDATE: 'bit_crm_workflow_update',
    VIEW: 'bit_crm_workflow_view'
  }
}

export default CAPABILITIES
