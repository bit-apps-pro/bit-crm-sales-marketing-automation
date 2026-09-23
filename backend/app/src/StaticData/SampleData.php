<?php

namespace BitApps\Crm\src\StaticData;

/**
 * Fixture for the one-time sample data set.
 *
 * Every record is named `Sample <Entity> <N>` so users can tell it apart
 * from their own data at a glance; only field values (industry, stage,
 * source, city) vary so the UI still has something to show.
 *
 * Records reference each other by the string keys used here, never by
 * database ids; SampleDataService resolves the keys while inserting.
 * `days_ago` backdates `created_at` so the dashboard's month comparison and
 * pipeline charts have history. Activity `due_in_days` is relative to now and
 * may be negative for overdue items.
 *
 * Deals reference pipeline stages by position (`stage_index`) among the
 * active open stages, or by `closed` => won|lost, because stage keys can be
 * renamed by the user. Every email uses the reserved example.com domain and
 * every phone number the fictional 555 range.
 */
class SampleData
{
    public const TAG_TITLE = 'Sample';

    public static function companies(): array
    {
        return [
            'company_1' => ['name' => 'Sample Company 1', 'industry' => 'Wholesale', 'type' => 'Customer', 'website' => 'https://sample-company-1.example.com', 'phone' => '+1 555 0101', 'employees_number' => 120, 'billing_city' => 'Portland', 'billing_country' => 'United States', 'days_ago' => 52],
            'company_2' => ['name' => 'Sample Company 2', 'industry' => 'Design', 'type' => 'Prospect', 'website' => 'https://sample-company-2.example.com', 'phone' => '+1 555 0102', 'employees_number' => 14, 'billing_city' => 'Austin', 'billing_country' => 'United States', 'days_ago' => 41],
            'company_3' => ['name' => 'Sample Company 3', 'industry' => 'Consulting', 'type' => 'Customer', 'website' => 'https://sample-company-3.example.com', 'phone' => '+1 555 0103', 'employees_number' => 45, 'billing_city' => 'Boston', 'billing_country' => 'United States', 'days_ago' => 33],
            'company_4' => ['name' => 'Sample Company 4', 'industry' => 'Transportation', 'type' => 'Partner', 'website' => 'https://sample-company-4.example.com', 'phone' => '+1 555 0104', 'employees_number' => 300, 'billing_city' => 'Denver', 'billing_country' => 'United States', 'days_ago' => 21],
            'company_5' => ['name' => 'Sample Company 5', 'industry' => 'Technology', 'type' => 'Customer', 'website' => 'https://sample-company-5.example.com', 'phone' => '+1 555 0105', 'employees_number' => 60, 'billing_city' => 'San Diego', 'billing_country' => 'United States', 'days_ago' => 5],
        ];
    }

    public static function contacts(): array
    {
        return [
            'contact_1' => ['first_name' => 'Sample', 'last_name' => 'Contact 1', 'email' => 'sample.contact1@example.com', 'phone' => '+1 555 0121', 'department' => 'Purchasing', 'lead_source' => 'external_referral', 'company' => 'company_1', 'days_ago' => 50],
            'contact_2' => ['first_name' => 'Sample', 'last_name' => 'Contact 2', 'email' => 'sample.contact2@example.com', 'phone' => '+1 555 0122', 'department' => 'Creative', 'lead_source' => 'facebook', 'company' => 'company_2', 'days_ago' => 40],
            'contact_3' => ['first_name' => 'Sample', 'last_name' => 'Contact 3', 'email' => 'sample.contact3@example.com', 'phone' => '+1 555 0123', 'department' => 'Management', 'lead_source' => 'employee_referral', 'company' => 'company_3', 'days_ago' => 30],
            'contact_4' => ['first_name' => 'Sample', 'last_name' => 'Contact 4', 'email' => 'sample.contact4@example.com', 'phone' => '+1 555 0124', 'department' => 'Fleet', 'lead_source' => 'online_store', 'company' => 'company_4', 'days_ago' => 20],
            'contact_5' => ['first_name' => 'Sample', 'last_name' => 'Contact 5', 'email' => 'sample.contact5@example.com', 'phone' => '+1 555 0125', 'department' => 'Engineering', 'lead_source' => 'cold_call', 'company' => 'company_5', 'days_ago' => 4],
        ];
    }

    public static function leads(): array
    {
        return [
            'lead_1' => ['first_name' => 'Sample', 'last_name' => 'Lead 1', 'email' => 'sample.lead1@example.com', 'phone' => '+1 555 0141', 'company_name' => 'Sample Lead Company 1', 'website' => 'https://sample-lead-1.example.com', 'lead_status' => 'qualifies', 'lead_source' => 'facebook', 'days_ago' => 45],
            'lead_2' => ['first_name' => 'Sample', 'last_name' => 'Lead 2', 'email' => 'sample.lead2@example.com', 'phone' => '+1 555 0142', 'company_name' => 'Sample Lead Company 2', 'website' => 'https://sample-lead-2.example.com', 'lead_status' => 'contract_sent', 'lead_source' => 'advertisement', 'days_ago' => 38],
            'lead_3' => ['first_name' => 'Sample', 'last_name' => 'Lead 3', 'email' => 'sample.lead3@example.com', 'phone' => '+1 555 0143', 'company_name' => 'Sample Lead Company 3', 'website' => 'https://sample-lead-3.example.com', 'lead_status' => 'negotiation_done', 'lead_source' => 'external_referral', 'days_ago' => 31],
            'lead_4' => ['first_name' => 'Sample', 'last_name' => 'Lead 4', 'email' => 'sample.lead4@example.com', 'phone' => '+1 555 0144', 'company_name' => 'Sample Lead Company 4', 'website' => 'https://sample-lead-4.example.com', 'lead_status' => 'discount_approved', 'lead_source' => 'online_store', 'days_ago' => 22],
            'lead_5' => ['first_name' => 'Sample', 'last_name' => 'Lead 5', 'email' => 'sample.lead5@example.com', 'phone' => '+1 555 0145', 'company_name' => 'Sample Lead Company 5', 'website' => 'https://sample-lead-5.example.com', 'lead_status' => 'qualifies', 'lead_source' => 'cold_call', 'days_ago' => 1],
        ];
    }

    /**
     * `stage_index` is the position among active open stages; `closed` picks
     * the won or lost stage instead. `closed_days_ago` only applies to closed deals.
     */
    public static function deals(): array
    {
        return [
            'deal_1' => ['name' => 'Sample Deal 1', 'amount' => 24000, 'type' => 'new-business', 'lead_source' => 'external-referral', 'contact' => 'contact_1', 'company' => 'company_1', 'closed' => 'won', 'closed_days_ago' => 35, 'description' => 'Sample deal 1: a won deal that shows up in the pipeline history.', 'days_ago' => 48],
            'deal_2' => ['name' => 'Sample Deal 2', 'amount' => 8500, 'type' => 'new-business', 'lead_source' => 'facebook', 'contact' => 'contact_2', 'company' => 'company_2', 'stage_index' => 2, 'description' => 'Sample deal 2: an open deal in the third pipeline stage.', 'days_ago' => 36],
            'deal_3' => ['name' => 'Sample Deal 3', 'amount' => 42000, 'type' => 'new-business', 'lead_source' => 'online-store', 'contact' => 'contact_4', 'company' => 'company_4', 'stage_index' => 1, 'description' => 'Sample deal 3: an open deal in the second pipeline stage.', 'days_ago' => 1],
            'deal_4' => ['name' => 'Sample Deal 4', 'amount' => 6000, 'type' => 'existing-business', 'lead_source' => 'cold-call', 'contact' => 'contact_5', 'company' => 'company_5', 'stage_index' => 0, 'description' => 'Sample deal 4: a new deal in the first pipeline stage.', 'days_ago' => 0],
            'deal_5' => ['name' => 'Sample Deal 5', 'amount' => 9800, 'type' => 'existing-business', 'lead_source' => 'external-referral', 'contact' => 'contact_2', 'company' => 'company_2', 'closed' => 'lost', 'closed_days_ago' => 14, 'description' => 'Sample deal 5: a lost deal that shows up in the pipeline history.', 'days_ago' => 25],
        ];
    }

    public static function activities(): array
    {
        return [
            ['type' => 'task', 'priority' => 'high', 'title' => 'Sample Task 1', 'details' => 'Sample task 1: a high priority task that is overdue.', 'entity' => 'deal_3', 'due_in_days' => -2, 'days_ago' => 6],
            ['type' => 'task', 'priority' => 'medium', 'title' => 'Sample Task 2', 'details' => 'Sample task 2: a medium priority task due today.', 'entity' => 'lead_2', 'due_in_days' => 0, 'days_ago' => 8],
            ['type' => 'meeting', 'title' => 'Sample Meeting 1', 'details' => 'Sample meeting 1: an upcoming meeting attached to a lead.', 'entity' => 'lead_1', 'due_in_days' => 2, 'days_ago' => 5],
            ['type' => 'meeting', 'title' => 'Sample Meeting 2', 'details' => 'Sample meeting 2: an overdue meeting attached to a deal.', 'entity' => 'deal_2', 'due_in_days' => -1, 'days_ago' => 9],
            ['type' => 'call', 'title' => 'Sample Call 1', 'details' => 'Sample call 1: an upcoming call attached to a lead.', 'entity' => 'lead_3', 'due_in_days' => 1, 'days_ago' => 3],
        ];
    }

    public static function notes(): array
    {
        return [
            ['title' => 'Sample Note 1', 'details' => 'Sample note 1: a note attached to a company.', 'entity' => 'company_1', 'days_ago' => 44],
            ['title' => 'Sample Note 2', 'details' => 'Sample note 2: a note attached to an open deal.', 'entity' => 'deal_3', 'days_ago' => 1],
            ['title' => 'Sample Note 3', 'details' => 'Sample note 3: a note attached to a lost deal.', 'entity' => 'deal_5', 'days_ago' => 14],
        ];
    }

    public static function links(): array
    {
        return [
            ['title' => 'Sample Link 1', 'link' => 'https://sample-link-1.example.com', 'description' => 'Sample link 1: a link attached to an open deal.', 'entity' => 'deal_3', 'days_ago' => 1],
            ['title' => 'Sample Link 2', 'link' => 'https://sample-link-2.example.com', 'description' => 'Sample link 2: a link attached to an open deal.', 'entity' => 'deal_2', 'days_ago' => 33],
        ];
    }
}
