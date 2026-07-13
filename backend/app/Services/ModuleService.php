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
