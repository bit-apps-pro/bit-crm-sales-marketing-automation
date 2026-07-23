<?php

namespace BitApps\Crm\Constants;

/**
 * Central registry of WordPress filter hook names used across Bit CRM.
 *
 * Every constant is the string name of a hook fired with `apply_filters()` in
 * the free plugin. The free plugin defines these extension points and ships
 * working defaults; the pro plugin (and third-party code) may hook in to
 * extend behaviour.
 *
 * Each constant's docblock states the hook signature as:
 *   apply_filters(<filtered value>, <extra args…>): <return type>
 * The first argument is always the value being filtered (and returned).
 */
class HookKeys
{
    /**
     * Filters the CRM admin sidebar menu items before they are rendered.
     *
     * apply_filters(array $menu): array
     */
    public const SIDEBAR_MENU = 'bit_crm_sidebar_menu';

    /**
     * Filters the list of registered CRM modules (lead, contact, company, deal).
     * The pro plugin appends its own modules (e.g. product) through this hook.
     *
     * apply_filters(array $modules): array
     */
    public const REGISTERED_MODULES = 'bit_crm_registered_modules';

    /**
     * Resolves the Model instance for a given module name.
     *
     * apply_filters(Model|false $instance, string $module): Model|false
     */
    public const MODULE_MODEL_INSTANCE = 'bit_crm_module_model_instance';

    /**
     * Resolves the entity service class name for a given module.
     *
     * apply_filters(?string $serviceClass, string $module): ?string
     */
    public const ENTITY_SERVICE_CLASS = 'bit_crm_entity_service_class';

    /**
     * Filters the extra admin capabilities granted beyond the built-in set.
     *
     * apply_filters(array $capabilities): array
     */
    public const ADMIN_CAPABILITIES = 'bit_crm_admin_capabilities';

    /**
     * Filters the additional user roles recognised by the CRM.
     *
     * apply_filters(array $roles): array
     */
    public const ADDITIONAL_ROLES = 'bit_crm_additional_roles';

    /**
     * Filters the selectable capability options shown in the role/permission UI.
     *
     * apply_filters(array $options): array
     */
    public const CAPABILITY_OPTIONS = 'bit_crm_capability_options';

    /**
     * Filters the list of currencies stored/enabled for the CRM.
     *
     * apply_filters(array $currencies): array
     */
    public const STORED_CURRENCIES = 'bit_crm_stored_currencies';

    /**
     * Filters the static (built-in) stored currencies list.
     *
     * apply_filters(array $currencies): array
     */
    public const STATIC_STORED_CURRENCIES = 'bit_crm_static_stored_currencies';

    /**
     * Resolves a single stored currency's data by its currency code.
     *
     * apply_filters(?array $currency, string $currencyCode): ?array
     */
    public const STORED_CURRENCY = 'bit_crm_stored_currency';

    /**
     * Filters the currency options list used in dropdowns/settings.
     *
     * apply_filters(array $options): array
     */
    public const CURRENCY_OPTIONS = 'bit_crm_currency_options';

    /**
     * Filters the non-home currency data set (currency codes, exchange rates).
     *
     * apply_filters(array $currencies): array
     */
    public const OTHER_CURRENCIES_DATA = 'bit_crm_other_currencies_data';

    // -------------------------------------------------------------------------
    // Custom Fields — extension points implemented by the pro plugin.
    //
    // In the free plugin these hooks have no listeners, so each returns its
    // first argument unchanged (a no-op). The pro plugin registers handlers
    // that read and write the custom_fields / custom_field_values tables.
    // -------------------------------------------------------------------------

    /**
     * Extends an entity's field-definition list with its custom fields.
     * Fired by each module service's fields() method.
     *
     * apply_filters(array $systemFields, string $module): array
     */
    public const FORMAT_CUSTOM_FIELDS = 'bit_crm_format_custom_fields';

    /**
     * Merges an entity's stored custom field values into its data array.
     * Fired by show() (with $includeDateMeta = true) and findById() (false).
     * When $includeDateMeta is true, a `date` custom field is returned as
     * ['field_type' => 'date', 'field_value' => …] so the UI can detect it;
     * otherwise the plain value is returned.
     *
     * apply_filters(array $data, string $module, int $id, bool $includeDateMeta): array
     */
    public const MERGE_CUSTOM_FIELDS = 'bit_crm_merge_custom_fields';

    /**
     * Persists custom field values after a new entity is created.
     *
     * do_action(string $module, int $entityId, array $customFieldsValues)
     */
    public const STORE_CUSTOM_FIELDS_VALUES = 'bit_crm_store_custom_fields_values';

    /**
     * Persists custom field values after an existing entity is updated.
     *
     * do_action(string $module, int $entityId, array $customFieldsValues)
     */
    public const UPDATE_CUSTOM_FIELDS_VALUES = 'bit_crm_update_custom_fields_values';

    /**
     * Stores custom field values for a batch of CSV-imported entities.
     * Each row in $rows carries a `reference_uuid` matching an entry in
     * $entityIds, used to correlate a CSV row with its inserted entity.
     *
     * do_action(string $module, array $entityIds, array $rows, array $customMap)
     */
    public const IMPORT_ENTITIES_CUSTOM_FIELDS = 'bit_crm_import_entities_custom_fields';

    /**
     * Updates custom field values for an existing entity matched during CSV import.
     *
     * do_action(string $module, int $entityId, array $row, array $customMap)
     */
    public const UPDATE_IMPORT_CUSTOM_FIELDS = 'bit_crm_update_import_custom_fields';

    /**
     * Transfers custom field values from leads onto the entities they were
     * converted into, applying any per-field override values last.
     *
     * do_action(string $targetModule, array $leadIdToEntityId, array $customFieldsMapping, array $overrides)
     */
    public const TRANSFER_CONVERTED_CUSTOM_FIELDS = 'bit_crm_transfer_converted_custom_fields';

    /**
     * Extends the list of related Model classes deleted alongside an entity.
     * Used by TrashService so the pro plugin can clean up custom_field_values
     * when an entity is permanently deleted.
     *
     * apply_filters(array $relatedModels): array
     */
    public const ENTITY_RELATED_MODELS = 'bit_crm_entity_related_models';

    /**
     * Adds validation rules for `customFieldsValues` to entity store/update
     * request classes.
     *
     * apply_filters(array $rules): array
     */
    public const CUSTOM_FIELD_VALUES_RULES = 'bit_crm_custom_field_values_rules';

    /**
     * Adds validation rules for `dealFieldOverrides.customFieldsValues` to the
     * lead-convert request classes.
     *
     * apply_filters(array $rules): array
     */
    public const DEAL_OVERRIDES_CUSTOM_FIELD_RULES = 'bit_crm_deal_overrides_custom_field_rules';

    /**
     * Provides the custom field keys defined for a module, used to recognise
     * custom fields in advanced (HAVING) filters.
     *
     * apply_filters(array $keys, string $module): array
     */
    public const CUSTOM_FIELDS_KEYS = 'bit_crm_custom_fields_keys';

    /**
     * Provides extra SELECT columns that pivot custom field values into a
     * module's search query result: MAX(CASE WHEN … END) AS `field_key`.
     *
     * apply_filters(string $sql, string $module): string
     */
    public const CUSTOM_FIELDS_COLUMNS = 'bit_crm_custom_fields_columns';

    /**
     * Provides the LEFT JOIN clause that attaches the custom_field_values
     * table to a module's search query.
     *
     * apply_filters(string $sql, string $module): string
     */
    public const CUSTOM_FIELDS_JOIN = 'bit_crm_custom_fields_join';

    /**
     * Validates whether an activity may be shared with a client. The client
     * portal is a pro feature, so the free plugin defines the extension point
     * and defaults to allowing the share (null); the pro plugin hooks in to
     * enforce that the contact has a portal user with the relevant capability.
     *
     * Returns null when the share is permitted, or an error array shaped
     * ['success' => false, 'errors' => string[]] when it is not.
     *
     * apply_filters(?array $error, int $entityId, string $activityType): ?array
     */
    public const VALIDATE_SHARED_ACTIVITY = 'bit_crm_validate_shared_activity';

    /**
     * Validates whether a note may be shared with a client. Mirrors
     * VALIDATE_SHARED_ACTIVITY: free defaults to allowing the share (null),
     * pro enforces the portal user's notes capability.
     *
     * apply_filters(?array $error, int $entityId): ?array
     */
    public const VALIDATE_SHARED_NOTE = 'bit_crm_validate_shared_note';

    /**
     * Forces workflow triggers to execute inline instead of dispatching a
     * background process. Enabled while firing hooks from inside a background
     * worker (e.g. bulk lead conversion), where a nested loopback dispatch
     * would hang. Honoured by the pro workflow executor.
     *
     * apply_filters(bool $runInline): bool
     */
    public const RUN_WORKFLOW_EXECUTION_INLINE = 'bit_crm/run_workflow_execution_inline';
}
