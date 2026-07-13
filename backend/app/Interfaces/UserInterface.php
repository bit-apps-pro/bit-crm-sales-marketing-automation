<?php

namespace BitApps\Crm\Interfaces;

interface UserInterface
{
    /**
     * Retrieve a list of users, optionally filtered by a search term.
     *
     * @param array $args optional arguments to filter users
     *
     * @return array an array of user objects
     */
    public function getUsers(array $args = []): array;

    /**
     * Retrieve a paginated list of users, optionally filtered by a search term.
     *
     * @param array $args optional arguments to filter users
     *
     * @return array an associative array containing:
     *               - 'data': an array of user objects for the current page,
     *               - 'pages': total number of pages,
     *               - 'total': total number of users matching the criteria,
     *               - 'current_total': number of users in the current page,
     *               - 'current_page': current page number,
     *               - 'last_page': last page number,
     *               - 'per_page': number of users per page
     */
    public function getPaginatedUsers(array $args = []): array;

    /**
     * Retrieve users formatted as options for selection inputs.
     *
     * @param array|bool $pagination pagination parameters or false for no pagination
     * @param null|string $searchTerm optional search term to filter users by display name
     *
     * @return list<array{label: non-empty-string, value: non-empty-string}> an array of users formatted as options
     */
    public function getUsersAsOptions(array|bool $pagination = false, ?string $searchTerm = null): array;

    /**
     * Retrieve entities formatted as options for selection inputs.
     *
     * This method is a wrapper around getUsersAsOptions to maintain consistency
     * with other entity services.
     *
     * @param array|bool $pagination pagination parameters or false for no pagination
     * @param null|string $searchTerm optional search term to filter users by display name
     * @param null|array $args optional arguments to filter users
     *
     * @return list<array{label: non-empty-string, value: non-empty-string}> an array of entities formatted as options
     */
    public function getEntitiesAsOptions(array|bool $pagination = false, int $skipId = 0, ?string $searchTerm = null, ?array $args = []): array;
}
