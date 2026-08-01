<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Crm\Model\Activity;
use BitApps\Crm\Model\Attachment;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Model\Link;
use BitApps\Crm\Model\Note;
use BitApps\Crm\Model\Setting;
use BitApps\Crm\Model\Tag;

return [
    'dashboard' => [
        ['label' => __('Dashboard View', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_dashboard'],
    ],
    Lead::MODULE_NAME => [
        ['label' => __('View', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_lead_view'],
        ['label' => __('Create', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_lead_create'],
        ['label' => __('Update', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_lead_update'],
        ['label' => __('Delete', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_lead_delete'],
        ['label' => __('Export', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_lead_export'],
        ['label' => __('Import', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_lead_import'],
    ],
    Contact::MODULE_NAME => [
        ['label' => __('View', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_contact_view'],
        ['label' => __('Create', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_contact_create'],
        ['label' => __('Update', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_contact_update'],
        ['label' => __('Delete', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_contact_delete'],
        ['label' => __('Export', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_contact_export'],
        ['label' => __('Import', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_contact_import'],
    ],
    Company::MODULE_NAME => [
        ['label' => __('View', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_company_view'],
        ['label' => __('Create', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_company_create'],
        ['label' => __('Update', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_company_update'],
        ['label' => __('Delete', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_company_delete'],
        ['label' => __('Export', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_company_export'],
        ['label' => __('Import', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_company_import'],
    ],
    Deal::MODULE_NAME => [
        ['label' => __('View', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_deal_view'],
        ['label' => __('Create', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_deal_create'],
        ['label' => __('Update', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_deal_update'],
        ['label' => __('Delete', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_deal_delete'],
        ['label' => __('Export', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_deal_export'],
        ['label' => __('Import', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_deal_import'],
    ],
    Activity::MODULE_NAME => [
        ['label' => __('View', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_activity_view'],
        ['label' => __('Create', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_activity_create'],
        ['label' => __('Update', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_activity_update'],
        ['label' => __('Delete', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_activity_delete'],
    ],
    Note::MODULE_NAME => [
        ['label' => __('View', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_note_view'],
        ['label' => __('Create', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_note_create'],
        ['label' => __('Update', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_note_update'],
        ['label' => __('Delete', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_note_delete'],
    ],
    Link::MODULE_NAME => [
        ['label' => __('View', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_link_view'],
        ['label' => __('Create', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_link_create'],
        ['label' => __('Update', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_link_update'],
        ['label' => __('Delete', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_link_delete'],
    ],
    Attachment::MODULE_NAME => [
        ['label' => __('View', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_attachment_view'],
        ['label' => __('Create', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_attachment_create'],
        ['label' => __('Delete', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_attachment_delete'],
    ],

    Tag::MODULE_NAME => [
        ['label' => __('View', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_tag_view'],
        ['label' => __('Create', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_tag_create'],
        ['label' => __('Update', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_tag_update'],
        ['label' => __('Delete', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_tag_delete'],
    ],
    Invoice::MODULE_NAME => [
        ['label' => __('View', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_invoice_view'],
        ['label' => __('Create', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_invoice_create'],
        ['label' => __('Update', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_invoice_update'],
        ['label' => __('Delete', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_invoice_delete'],
    ],
    Setting::MODULE_NAME => [
        ['label' => __('General Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_general'],
        ['label' => __('Lead Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_lead'],
        ['label' => __('Contact Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_contact'],
        ['label' => __('Company Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_company'],
        ['label' => __('Deal Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_deal'],
        ['label' => __('Product Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_product'],
        ['label' => __('Imap Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_imap'],
        ['label' => __('Currency Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_currency'],
        ['label' => __('Invoice Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_invoice'],
        ['label' => __('Data Management Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_data_management'],
        ['label' => __('SMTP Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_smtp'],
        ['label' => __('Integration Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_integration'],
        ['label' => __('CRM Users', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_crm_user'],
        ['label' => __('REST API Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_api'],
        ['label' => __('Workflow Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_workflow'],
        ['label' => __('History Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_history'],
        ['label' => __('Portal Settings', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_setting_portal'],
    ],
    'others' => [
        ['label' => __('History View', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_history_view'],
        ['label' => __('Support & License', 'bit-crm-sales-marketing-automation'), 'value' => 'bit_crm_manage_support_license'],
    ]
];
