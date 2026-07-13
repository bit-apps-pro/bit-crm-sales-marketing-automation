<?php

namespace BitApps\Crm\Services;

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
                'columns_order'   => 'contact_deal_table_columns_order',
                'visible_columns' => 'contact_deal_table_visible_columns',
            ],
        ],
        Company::MODULE_NAME => [
            Contact::MODULE_NAME => [
                'columns_order'   => 'company_contact_table_columns_order',
                'visible_columns' => 'company_contact_table_visible_columns',
            ],
            Deal::MODULE_NAME => [
                'columns_order'   => 'company_deal_table_columns_order',
                'visible_columns' => 'company_deal_table_visible_columns',
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
