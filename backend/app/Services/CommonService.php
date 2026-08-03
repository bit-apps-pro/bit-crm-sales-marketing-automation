<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Deps\BitApps\WPValidator\Validator;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Lead;

class CommonService
{
    private const RELATED_ENTITY_TABLE_SETTINGS_KEYS = [
        Contact::MODULE_NAME => [
            Deal::MODULE_NAME => [
                'columns_order'   => Contact::SETTINGS_KEYS['DEAL_TABLE_COLUMNS_ORDER'],
                'visible_columns' => Contact::SETTINGS_KEYS['DEAL_TABLE_VISIBLE_COLUMNS'],
            ],
        ],
        Company::MODULE_NAME => [
            Contact::MODULE_NAME => [
                'columns_order'   => Company::SETTINGS_KEYS['CONTACT_TABLE_COLUMNS_ORDER'],
                'visible_columns' => Company::SETTINGS_KEYS['CONTACT_TABLE_VISIBLE_COLUMNS'],
            ],
            Deal::MODULE_NAME => [
                'columns_order'   => Company::SETTINGS_KEYS['DEAL_TABLE_COLUMNS_ORDER'],
                'visible_columns' => Company::SETTINGS_KEYS['DEAL_TABLE_VISIBLE_COLUMNS'],
            ],
        ],
    ];

    private const ENTITY_FOREIGN_KEYS = [
        Contact::MODULE_NAME => Contact::FOREIGN_KEY,
        Company::MODULE_NAME => Company::FOREIGN_KEY,
        Deal::MODULE_NAME    => Deal::FOREIGN_KEY,
    ];

    /**
     * Appends created and updated user display names to an entity payload.
     *
     * @param array<string, mixed> $entity
     */
    public static function appendAuditUserNames(array &$entity): void
    {
        if (empty($entity)) {
            return;
        }

        $entity['created_by_name'] = self::resolveUserDisplayName($entity['created_by'] ?? null);
        $entity['updated_by_name'] = self::resolveUserDisplayName($entity['updated_by'] ?? null);
    }

    /**
     * Appends the entity's stored custom field values to the model under a
     * single "custom_fields_values" attribute, keyed by field key with each
     * entry as ['field_id' => custom field id, 'field_value' => decoded
     * value, 'field_key' => key]. System-defined attributes are untouched.
     * Intended for enriching entity hook payloads (bit_crm/*_created,
     * bit_crm/*_updated). The attribute is always present; it stays an empty
     * array when the entity has no custom field values (or the pro plugin is
     * inactive).
     *
     * @param mixed $model an entity model with an id attribute
     *
     * @return mixed the same model instance
     */
    public static function appendCustomFieldsValues($model, string $module)
    {
        if (empty($model->id)) {
            return $model;
        }

        $values = Hooks::applyFilter(HookKeys::GET_CUSTOM_FIELDS_VALUES, [], $module, (int) $model->id);

        // setAttribute() marks the attribute dirty on an existing model, and a
        // later $model->update()/save() persists ALL dirty attributes — which
        // would emit "custom_fields_values" as a table column and fail the
        // query (workflow update-entity actions call update() on this very
        // payload model). Toggling the exists flag off makes the enrichment
        // untracked, so it can never leak into a write.
        $model->setExists(false);
        $model->custom_fields_values = $values;
        $model->setExists(true);

        return $model;
    }

    public function getPrevAndNextEntityId(string $table, int $id): array|bool
    {
        if (empty($table) || $id <= 0) {
            return false;
        }

        // the Lead model will be replaced with a generic DB connection in future (once we have it)
        $result = Lead::raw(
            'SELECT 
                (SELECT id FROM %1s WHERE id < %2d AND is_trash = 0 ORDER BY id DESC LIMIT 1) AS previous_id,
                (SELECT id FROM %3s WHERE id > %4d AND is_trash = 0 ORDER BY id ASC LIMIT 1) AS next_id',
            [$table, $id, $table, $id]
        );

        if (empty($result)) {
            return false;
        }

        return [$result[0]->previous_id ?? null, $result[0]->next_id ?? null];
    }

    public function filterRequiredFields(array $fields): array
    {
        $required = [];

        foreach ($fields as $field) {
            $groupFields = $field['group_fields'] ?? [];

            if (!empty($groupFields)) {
                array_push($required, ...$this->filterRequiredFields($groupFields));

                continue;
            }

            if (!empty($field['required']) && $field['required']) {
                $required[] = $field;
            }
        }

        return $required;
    }

    public static function getEntityForeignKey(string $module): ?string
    {
        return self::ENTITY_FOREIGN_KEYS[$module] ?? null;
    }

    public static function getRelatedEntityTableSettingsKeys(string $entity, string $relatedEntity): ?array
    {
        return self::RELATED_ENTITY_TABLE_SETTINGS_KEYS[$entity][$relatedEntity] ?? null;
    }

    public function formatCounts($countsRaw): array
    {
        $counts = (array) ($countsRaw[0] ?? []);

        foreach ($counts as $key => $value) {
            $value = (int) $value;

            if ($value === 0) {
                $counts[$key] = '';

                continue;
            }

            if ($value >= 100) {
                $counts[$key] = '99+';

                continue;
            }

            $counts[$key] = (string) $value;
        }

        return $counts;
    }

    public static function resolveValidatedData(array|Request $data, array $rules): array
    {
        if ($data instanceof Request) {
            return $data->validated();
        }

        $validator = new Validator();

        $validator->make($data, $rules);

        if ($validator->fails()) {
            return ['success' => false, 'errors' => $validator->errors()];
        }

        return $validator->validated();
    }

    /**
     * Given an update() rules set, returns a copy where "id" is the only
     * required field — for update() methods called directly with an array
     * (via the API or another plugin) instead of through the HTTP request
     * pipeline.
     */
    public static function makeOnlyIdRequired(array $rules): array
    {
        foreach ($rules as $field => $fieldRules) {
            if ($field === 'id' || !\is_array($fieldRules)) {
                continue;
            }

            $fieldRules = array_values(array_filter($fieldRules, static fn ($rule) => $rule !== 'required'));

            if (!\in_array('nullable', $fieldRules, true)) {
                array_unshift($fieldRules, 'nullable');
            }

            $rules[$field] = $fieldRules;
        }

        return $rules;
    }

    private static function resolveUserDisplayName($userId): ?string
    {
        if (empty($userId) || !is_numeric($userId)) {
            return null;
        }

        $normalizedUserId = (int) $userId;
        if ($normalizedUserId <= 0) {
            return null;
        }

        return ($user = get_userdata($normalizedUserId)) ? $user->display_name : null;
    }
}
