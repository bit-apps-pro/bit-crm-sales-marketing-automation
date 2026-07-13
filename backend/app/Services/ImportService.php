<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\Model\ImportExportList;
use BitApps\Crm\src\StaticData\CurrencyHelper;
use BitApps\Crm\Utils\ArrUtils;

abstract class ImportService
{
    protected $importId;

    private $model;

    public function __construct(int $importId)
    {
        $this->importId = $importId;
    }

    /**
     * Separates entities into new and existing ones based on database lookup.
     *
     * @param array  $entities       The entities to separate
     * @param string $sourceKey      The key in import entities to match against
     * @param string $dbColumn The column in the database model to match against
     *
     * @return array                 [newEntities, oldEntities, storedEntities]
     */
    public function separateEntities(array $entities, string $sourceKey, string $dbColumn): array
    {
        if (empty($this->model)) {
            return [];
        }

        $uniqueValues = ArrUtils::uniqueTruthyValuesByKey($entities, $sourceKey);
        $storedEntities = $this->model::whereIn($dbColumn, $uniqueValues)->get();
        $storedEntities = empty($storedEntities) ? [] : $storedEntities->toArray();
        $storedUniqueValues = ArrUtils::uniqueTruthyValuesByKey($storedEntities, $dbColumn);

        $newEntities = [];
        $oldEntities = [];
        foreach ($entities as $entity) {
            if (\in_array($entity[$sourceKey], $storedUniqueValues)) {
                $oldEntities[] = $entity;

                continue;
            }
            $newEntities[] = $entity;
        }

        return [$newEntities, $oldEntities, $storedEntities];
    }

    public function model($model)
    {
        $this->model = $model;

        return $this;
    }

    /**
     * Get initial count details array for import operations.
     */
    protected function getDefaultCountDetails(?int $fetchLimit = 0): array
    {
        return [
            ImportExportList::COUNT['COMPLETED'] => 0,
            ImportExportList::COUNT['UPDATED']   => 0,
            ImportExportList::COUNT['SKIPPED']   => $fetchLimit,
        ];
    }

    /**
     * Extract IDs and reference UUIDs from inserted rows.
     *
     * @param mixed $rows
     */
    protected function extractIds($rows): array
    {
        return array_map(
            fn ($item) => [
                'id'             => $item['id'],
                'reference_uuid' => $item['reference_uuid'],
            ],
            $rows->toArray()
        );
    }

    /**
     * Format owner field, validating owner IDs and setting current user as default.
     */
    protected function formatOwnerField(array &$entities): void
    {
        $currentUserId = get_current_user_id();
        $ownerIds = ArrUtils::uniqueTruthyValuesByKey($entities, 'owner_id');

        if (empty($ownerIds)) {
            foreach ($entities as &$entity) {
                $entity['owner_id'] = $currentUserId;
            }

            return;
        }

        // TODO: will use method from UserService
        $users = get_users(
            [
                'include' => $ownerIds,
                'fields'  => 'ID'
            ]
        );
        $validUserIds = array_flip($users);

        foreach ($entities as &$entity) {
            if (!isset($entity['owner_id']) || !isset($validUserIds[$entity['owner_id']])) {
                $entity['owner_id'] = $currentUserId;
            }
        }
    }

    /**
     * Map entity data to system fields.
     */
    protected function mapEntityToSystemFields(array $entity, array $systemMap, string $uuid): array
    {
        $fields = [
            'reference_uuid' => Uuid::uuidToBinary($uuid),
            'import_id'      => $this->importId,
            'created_by'     => get_current_user_id(),
        ];

        foreach ($systemMap as $csvKey => $dbKey) {
            $fields[$dbKey] = $entity[$csvKey] ?? null;
        }

        return $fields;
    }

    /**
     * Default data used when creating new related records during imports.
     *
     * Provides sensible defaults for insert operations (owner, currency, import id).
     *
     * @return array<string,mixed>
     */
    protected function getInitialInsertData(): array
    {
        return [
            'owner_id'   => get_current_user_id(),
            'currency'   => CurrencyHelper::getHomeCurrency(),
            'import_id'  => $this->importId,
            'created_by' => get_current_user_id(),
        ];
    }

    /**
     * Return the first entity from $entities where $entity[$column] === $value.
     *
     * @param string $column
     * @param mixed  $value
     * @param array  $entities
     *
     * @return array|false first matching entity array, or false if none found
     */
    protected function getEntityByColumn($column, $value, $entities)
    {
        $filtered = array_filter(
            $entities,
            function ($entity) use ($column, $value) {
                return $entity[$column] === $value;
            }
        );

        return reset($filtered);
    }

    /**
     * Validate lookup field IDs against database records.
     *
     * Extracts unique IDs from entities and returns a map of valid IDs that exist in the database.
     * Used to verify ID-based lookup references during import.
     *
     * @param array  $entities Entity records containing ID field
     * @param string $idKey  ID field name to validate (e.g., 'company_id')
     *
     * @return array Map of valid IDs [id => true]
     */
    protected function getExistingIds(array $entities, string $idKey): array
    {
        $existingIds = [];
        if (empty($this->model)) {
            return $existingIds;
        }

        $ids = ArrUtils::uniqueTruthyValuesByKey($entities, $idKey);
        if (!empty($ids)) {
            $records = $this->model::whereIn('id', $ids)->get();
            foreach ($records as $record) {
                $existingIds[$record->id] = true;
            }
        }

        return $existingIds;
    }

    /**
     * Build name-to-ID mapping for lookup field resolution.
     *
     * Extracts unique names from entities and queries database to map names to their IDs.
     * Used to resolve name-based lookup references during import.
     *
     * @param array  $entities   Entity records containing name field
     * @param string $nameKey  Name field in entities (e.g., 'company_name_lookup')
     * @param string $nameColumn Column in database to match against (e.g., 'name')
     *
     * @return array Name-to-ID mapping [name => id]
     */
    protected function getExistingNames(array $entities, string $nameKey, string $nameColumn): array
    {
        $existingNames = [];
        if (empty($this->model)) {
            return $existingNames;
        }

        $names = ArrUtils::uniqueTruthyValuesByKey($entities, $nameKey);
        if (!empty($names)) {
            $records = $this->model::whereIn($nameColumn, $names)->get();
            foreach ($records as $record) {
                if (!isset($existingNames[$record->{$nameColumn}])) {
                    $existingNames[$record->{$nameColumn}] = $record->id;
                }
            }
        }

        return $existingNames;
    }

    /**
     * Create a new entity record when resolving name-based lookup fields.
     *
     * Used during import when a referenced name doesn't exist in the database.
     * Merges initial data with the name and generates a unique reference UUID.
     *
     * @param string $nameColumn  Column to store the name (e.g., 'name', 'last_name')
     * @param string $name        Name value to create
     * @param array  $initialData Default data (owner, currency, import_id)
     *
     * @return mixed Inserted record or false on failure
     */
    protected function createEntityByName(string $nameColumn, string $name, array $initialData)
    {
        if (empty($this->model)) {
            return false;
        }

        $data = array_merge(
            $initialData,
            [
                $nameColumn      => $name,
                'reference_uuid' => Uuid::generate()
            ]
        );

        return $this->model::insert($data);
    }

    /**
     * Resolve entity ID from name lookup.
     *
     * Attempts to find entity ID by name in three steps:
     * 1. Check if name exists in database (existingNames)
     * 2. Check if name was already created in this import batch (createdCache)
     * 3. Create new entity with the name
     *
     * @param string $name          Name to resolve
     * @param array  $existingNames Name-to-ID mapping from database
     * @param array  &$createdCache Name-to-ID cache for newly created entities (updated by reference)
     * @param string $nameColumn    Database column name for the entity name
     * @param array  $initialData   Default data for creating new entity
     *
     * @return null|int Resolved entity ID or null if creation failed
     */
    protected function resolveNameLookup(
        string $name,
        array $existingNames,
        array &$createdCache,
        string $nameColumn,
        array $initialData
    ): ?int {
        if (isset($existingNames[$name])) {
            return $existingNames[$name];
        }

        if (isset($createdCache[$name])) {
            return $createdCache[$name];
        }

        $newRecord = $this->createEntityByName($nameColumn, $name, $initialData);

        if ($newRecord) {
            $createdCache[$name] = $newRecord->id;

            return $newRecord->id;
        }

        return null;
    }

    /**
     * Process lookup fields supporting both ID and Name mapping.
     *
     * Handles two mapping types:
     * - ID mapping: Validates ID exists, sets null if invalid (e.g., company_id = 5)
     * - Name mapping: Finds by name or creates new record (e.g., company_name_lookup = "Company Name")
     *
     * ID takes priority if both are present. Name field is removed after processing.
     *
     * @param array  &$entities   Entity records to process (modified by reference)
     * @param string $idKey     ID field name (e.g., 'company_id')
     * @param string $nameKey   Name field name (e.g., 'company_name_lookup')
     * @param string $nameColumn  Column to match names against (e.g., 'name')
     */
    protected function processLookupField(
        array &$entities,
        string $idKey,
        string $nameKey,
        string $nameColumn,
    ): void {
        $existingIds = $this->getExistingIds($entities, $idKey);
        $existingNames = $this->getExistingNames($entities, $nameKey, $nameColumn);
        $initialData = $this->getInitialInsertData();

        $createdCache = [];
        foreach ($entities as &$entity) {
            if (!empty($entity[$idKey])) {
                if (!isset($existingIds[$entity[$idKey]])) {
                    $entity[$idKey] = null;
                }
            } elseif (!empty($entity[$nameKey])) {
                $entity[$idKey] = $this->resolveNameLookup(
                    $entity[$nameKey],
                    $existingNames,
                    $createdCache,
                    $nameColumn,
                    $initialData
                );
            } else {
                $entity[$idKey] = null;
            }

            unset($entity[$nameKey]);
        }
    }
}
