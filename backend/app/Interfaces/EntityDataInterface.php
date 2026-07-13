<?php

namespace BitApps\Crm\Interfaces;

interface EntityDataInterface
{
    /**
     * Search for entities based on provided parameters.
     *
     * @param array $params the search parameters
     *
     * @return array an array of entities matching the search criteria
     */
    public function search(array $params): array;

    /**
     * Retrieve entity data by its ID.
     *
     * @param int $id the ID of the entity to retrieve
     *
     * @return array|bool an associative array of entity data if found, or false if not found
     */
    public function findById(int $id): array|bool;

    /**
     * Retrieve tags associated with the entity by its ID.
     *
     * @param int $id the ID of the entity whose tags to retrieve
     *
     * @return array|bool an array of tags if found, or false if no tags are associated
     */
    public function getTags(int $id): array|bool;

    /**
     * Retrieve entities formatted as options for selection inputs.
     *
     * @param array|bool $pagination pagination parameters or false for no pagination
     *
     * @return list<array{label: non-empty-string, value: non-empty-string}> an array of entities formatted as options
     */
    public function getEntitiesAsOptions(array|bool $pagination = false, int $skipId = 0, ?string $searchTerm = null, ?array $columnSelect = []): array;

    /**
     * Retrieve entity formatted as option for selection inputs.
     *
     * @param int $id the ID of the entity to retrieve
     *
     * @return array{label: non-empty-string, value: non-empty-string}|bool an array containing the label and value of the entity, or false if not found
     */
    public function getEntityAsOption(int $id, ?array $columnSelect = []): array|bool;

    /**
     * Get the display name of the entity based on its data.
     *
     * @param array $data the entity data
     *
     * @return string the formatted display name of the entity
     */
    public function getDisplayName(array $data): string;

    /**
     * Get the previous and next entity IDs relative to the given entity ID.
     *
     * @param int $id the ID of the current entity
     *
     * @return array{0: null|int, 1: null|int}|bool an array containing the previous and next entity IDs, or false if not applicable
     */
    public function getPrevAndNextId(int $id): array|bool;

    /**
     * Get entity IDs by a specific column value.
     *
     * @param string $column the column name to search by
     * @param mixed $value the value to match in the specified column
     *
     * @return array an array of matching entity IDs
     */
    public function getIdsByColumn(string $column, $value): array|bool;

    /**
     * Get the model class associated with the entity.
     *
     * @return class-string the model class name
     */
    public function getModel(): string;
}
