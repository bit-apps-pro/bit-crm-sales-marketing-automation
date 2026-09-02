<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\src\Capability;

class ModuleService
{
    public const MODULES = [
        Lead::MODULE_NAME,
        Contact::MODULE_NAME,
        Company::MODULE_NAME,
        Deal::MODULE_NAME,
        Invoice::MODULE_NAME,
        UserService::MODULE_NAME,
        WooCommerceProductService::MODULE_NAME,
    ];

    public const SUB_MODULES = [
        Activity::MODULE_NAME,
    ];

    /**
     * Modules that carry no CRM record data, so no view capability guards them.
     *
     * 'user' returns WordPress users as id + display name, which any logged-in
     * caller can already enumerate through WordPress itself. The e-commerce
     * catalogues mirror products the store already publishes. Nothing here
     * exposes contacts, leads, companies or deals.
     *
     * 'fluent_cart_product' is registered by the pro plugin, so it is listed by
     * name rather than by class constant. Keep this list closed: adding a
     * module here removes its access check.
     */
    public const CAPABILITY_EXEMPT_MODULES = [
        UserService::MODULE_NAME,
        WooCommerceProductService::MODULE_NAME,
        'fluent_cart_product',
    ];

    public const MODULE_VIEW_CAPABILITIES = [
        Lead::MODULE_NAME    => 'bit_crm_lead_view',
        Contact::MODULE_NAME => 'bit_crm_contact_view',
        Company::MODULE_NAME => 'bit_crm_company_view',
        Deal::MODULE_NAME    => 'bit_crm_deal_view',
        Invoice::MODULE_NAME => 'bit_crm_invoice_view',
    ];

    /**
     * View capability guarding a module's records, or null when the module has
     * none.
     *
     * Null is not "allow" -- it only means this module has no record-level view
     * capability of its own. Modules registered by add-ons map themselves in
     * through HookKeys::MODULE_VIEW_CAPABILITIES; the ones that legitimately
     * have no capability are those exposing no CRM record data, which
     * exposesRecordData() identifies. Callers gating access must consult both.
     *
     * $module is deliberately untyped: authorize() runs before validation, so
     * callers pass raw request input and a caller sending relatedModule[]= must
     * be denied, not met with a TypeError.
     *
     * @param mixed $module
     */
    public static function moduleViewCapability($module): ?string
    {
        if (!\is_string($module) || $module === '') {
            return null;
        }

        $capabilities = Hooks::applyFilter(HookKeys::MODULE_VIEW_CAPABILITIES, self::MODULE_VIEW_CAPABILITIES);

        if (!\is_array($capabilities)) {
            return null;
        }

        $capability = $capabilities[$module] ?? null;

        return \is_string($capability) && $capability !== '' ? $capability : null;
    }

    /**
     * Whether reading this module exposes CRM record data that a view
     * capability must guard.
     *
     * True for every module except the reference lists that carry no CRM
     * records of their own: 'user' resolves WordPress users the caller can
     * already enumerate, and the e-commerce product catalogues mirror data the
     * store already publishes. Everything else -- known or added later -- is
     * treated as record data, so a module that forgets to map a capability
     * fails closed rather than leaking.
     *
     * @param mixed $module raw request input; see moduleViewCapability()
     */
    public static function exposesRecordData($module): bool
    {
        return !\in_array($module, self::CAPABILITY_EXEMPT_MODULES, true);
    }

    /**
     * Whether the current user may read this module's records.
     *
     * The single rule behind every module-scoped authorize() check: modules
     * exposing no CRM record data are allowed, everything else needs its view
     * capability, and a module that exposes record data without mapping a
     * capability is denied.
     *
     * @param mixed $module raw request input; see moduleViewCapability()
     */
    public static function canViewModule($module): bool
    {
        if (!self::exposesRecordData($module)) {
            return true;
        }

        $capability = self::moduleViewCapability($module);

        return $capability !== null && Capability::check($capability);
    }

    public static function isValidModule(string $module): bool
    {
        if (empty($module)) {
            return false;
        }

        $modules = Hooks::applyFilter(HookKeys::REGISTERED_MODULES, self::MODULES);

        return \in_array($module, $modules);
    }

    public static function getModelInstanceByModule(string $module): bool|object
    {
        if (!self::isValidModule($module)) {
            return false;
        }

        switch ($module) {
            case Lead::MODULE_NAME:
                return new Lead();

            case Contact::MODULE_NAME:
                return new Contact();

            case Company::MODULE_NAME:
                return new Company();

            case Deal::MODULE_NAME:
                return new Deal();

            case Invoice::MODULE_NAME:
                return new Invoice();

            default:
                return Hooks::applyFilter(HookKeys::MODULE_MODEL_INSTANCE, false, $module);
        }
    }
}
