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
            'icon'       => 'data:image/svg+xml;base64,' . base64_encode('<svg width="431" height="466" viewBox="0 0 431 466" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M413.68 398.681C425.016 379.323 430.597 357.697 430.597 333.455C430.597 303.807 422.749 279.042 406.878 259.509C391.008 239.976 366.417 226.024 332.932 218.002C354.907 210.328 371.649 199.864 383.16 186.784C400.425 167.076 408.971 148.764 408.971 115.977C408.971 83.1894 396.937 55.634 372.87 33.3106C348.802 11.1617 314.445 0 269.45 0H78.6549C35.229 0 0 35.2291 0 78.655V387.345C0 430.771 35.229 466 78.6549 466H248.522C259.16 466 280.612 463.907 313.05 459.722C337.292 456.408 355.604 451.35 367.638 444.374C386.996 433.213 402.518 418.04 413.68 398.681ZM167.594 224.946V246.921C167.594 273.256 188.871 294.532 215.205 294.532H271.362C297.697 294.532 318.974 315.809 318.974 342.144C318.974 368.479 297.697 389.756 271.362 389.756H169.861C115.971 389.756 72.3706 346.155 72.3706 292.265V179.602C72.3706 125.712 115.971 82.1118 169.861 82.1118H271.362C297.697 82.1118 318.974 103.389 318.974 129.723C318.974 156.058 297.697 177.335 271.362 177.335H215.205C188.871 177.335 167.594 198.612 167.594 224.946Z" fill="white"/></svg>'), // phpcs:ignore Generic.Files.LineLength.MaxExceeded
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
