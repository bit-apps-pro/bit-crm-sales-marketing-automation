<?php

namespace BitApps\Crm\src;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Views\Body;

final class Menu
{
    /**
     * Provides menus for wordpress admin sidebar.
     * should return an array of menus with the following structure:
     * [
     *   'type' => menu | submenu,
     *  'name' => 'Name of menu will shown in sidebar',
     *  'capability' => 'capability required to access menu',
     *  'slug' => 'slug of menu after ?page=',.
     *
     *  'title' => 'page title will be shown in browser title if type is menu',
     *  'callback' => 'function to call when menu is clicked',
     *  'icon' =>   'icon to display in menu if menu type is menu',
     *  'position' => 'position of menu in sidebar if menu type is menu',
     *
     * 'parent' => 'parent slug if submenu'
     * ]
     *
     * @return array
     */
    public static function getSideBarMenu(Body $body)
    {
        $menu = [
            'Home'      => self::getHomeMenuAttributes($body),
            'Dashboard' => self::getDashboardMenuAttributes(),
            'Leads'     => self::getLeadMenuAttributes(),
            'Contacts'  => self::getContactMenuAttributes(),
            'Companies' => self::getCompanyMenuAttributes(),
            'Deals'     => self::getDealMenuAttributes(),
            'Invoices'  => self::getInvoicesMenuAttributes(),
            'Tags'      => self::getTagMenuAttributes(),
            'Settings'  => self::getSettingsMenuAttributes(),
        ];

        return Hooks::applyFilter(HookKeys::SIDEBAR_MENU, $menu);
    }

    private static function getHomeMenuAttributes($body)
    {
        return [
            'type'       => 'menu',
            'title'      => __('Bit CRM - CRM for WordPress', 'bit-crm-sales-marketing-automation'),
            'name'       => __('Bit CRM', 'bit-crm-sales-marketing-automation'),
            'capability' => 'bit_crm_menu',
            'slug'       => Config::SLUG,
            'callback'   => [$body, 'render'],
            'icon'       => 'dashicons-admin-home',
            'position'   => '20',
        ];
    }

    private static function getDashboardMenuAttributes()
    {
        return [
            'parent'     => Config::SLUG,
            'type'       => 'submenu',
            'name'       => 'Dashboard',
            'capability' => 'bit_crm_dashboard',
            'slug'       => Config::SLUG . '#/',
        ];
    }

    private static function getLeadMenuAttributes()
    {
        return [
            'parent'     => Config::SLUG,
            'type'       => 'submenu',
            'name'       => 'Leads',
            'capability' => 'bit_crm_lead_menu',
            'slug'       => Config::SLUG . '#/leads',
        ];
    }

    private static function getContactMenuAttributes()
    {
        return [
            'parent'     => Config::SLUG,
            'type'       => 'submenu',
            'name'       => 'Contacts',
            'capability' => 'bit_crm_contact_menu',
            'slug'       => Config::SLUG . '#/contacts',
        ];
    }

    private static function getCompanyMenuAttributes()
    {
        return [
            'parent'     => Config::SLUG,
            'type'       => 'submenu',
            'name'       => 'Companies',
            'capability' => 'bit_crm_company_menu',
            'slug'       => Config::SLUG . '#/companies',
        ];
    }

    private static function getDealMenuAttributes()
    {
        return [
            'parent'     => Config::SLUG,
            'type'       => 'submenu',
            'name'       => 'Deals',
            'capability' => 'bit_crm_deal_menu',
            'slug'       => Config::SLUG . '#/deals',
        ];
    }

    private static function getTagMenuAttributes()
    {
        return [
            'parent'     => Config::SLUG,
            'type'       => 'submenu',
            'name'       => 'Tags',
            'capability' => 'bit_crm_tag_menu',
            'slug'       => Config::SLUG . '#/tags',
        ];
    }

    private static function getInvoicesMenuAttributes()
    {
        return [
            'parent'     => Config::SLUG,
            'type'       => 'submenu',
            'name'       => 'Invoices',
            'capability' => 'bit_crm_invoice_menu',
            'slug'       => Config::SLUG . '#/invoices',
        ];
    }

    private static function getSettingsMenuAttributes()
    {
        return [
            'parent'     => Config::SLUG,
            'type'       => 'submenu',
            'name'       => 'Settings',
            'capability' => 'bit_crm_setting_menu',
            'slug'       => Config::SLUG . '#/settings',
        ];
    }
}
