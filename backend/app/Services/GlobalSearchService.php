<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Factories\EntityFactory;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Model\Note;
use BitApps\Crm\src\Capability;
use BitApps\Crm\Utils\Logger;
use Throwable;

/**
 * Backs the header's global search: a few best matches per record type, each with
 * the in-app path it opens.
 *
 * Record modules (leads, contacts, companies, deals, and pro's products) go through
 * their list pages' own search services, so a record found here is found the same
 * way there. Groups with no search service (invoices, activities, notes) use a lean
 * query of their own. A group the user cannot view is skipped, not refused. Pro and
 * add-ons add groups through HookKeys::GLOBAL_SEARCH_GROUPS.
 */
class GlobalSearchService
{
    public const SCOPE_ALL = 'all';

    public const RESULT_LIMIT = 5;

    /**
     * Rows read per group before ranking, so a close match that is not among the
     * newest few still makes the cut.
     */
    private const RANK_WINDOW = 20;

    /**
     * The record modules the user may view, by module: the detail route an activity
     * or note opens on, and the table its record must still be live in.
     *
     * @var array<string, array{route: string, table: string}>
     */
    private array $parents = [];

    /**
     * @return array<int, array<string, mixed>>
     */
    public function search(string $term, string $scope): array
    {
        $term = trim($term);

        if ($term === '') {
            return [];
        }

        $recordId = preg_match('/^#(\d+)$/', $term, $matches) ? (int) $matches[1] : 0;
        $definitions = $this->getGroupDefinitions();
        $this->parents = $this->getViewableParents($definitions);
        $groups = [];

        foreach ($definitions as $key => $group) {
            // Numerous, loosely matching groups would crowd "all", so they answer only to their own filter.
            $inScope = $scope === self::SCOPE_ALL ? empty($group['scopeOnly']) : $key === $scope;
            $canView = isset($group['capability']) ? Capability::check($group['capability']) : ModuleService::canViewModule($key);

            if (!$inScope || !$canView) {
                continue;
            }

            try {
                [$rows, $total] = isset($group['model'])
                    ? $this->getQueryMatches($group, $term, $recordId)
                    : $this->getServiceMatches($key, $group, $term, $recordId);
            } catch (Throwable $th) {
                // One failing group should not take the whole search down with it.
                Logger::error($th);

                continue;
            }

            if ($rows === []) {
                continue;
            }

            $groups[] = [
                'key'      => $key,
                'label'    => $group['label'],
                'items'    => \array_slice($this->rankItems(array_map(fn ($row) => $this->formatItem($group, (array) $row), $rows), $term), 0, self::RESULT_LIMIT),
                'total'    => $total,
                'listPath' => isset($group['listPath']) && $recordId === 0 ? $group['listPath'] . rawurlencode($term) : null,
            ];
        }

        return $groups;
    }

    /**
     * The built-in groups, then whatever HookKeys::GLOBAL_SEARCH_GROUPS adds (its docblock
     * has the shape). Free-internal groups may instead be query-backed: 'model' (class),
     * 'select' and 'match' (columns on alias `t`), optional 'join' and 'where'; and activity
     * or note groups set 'parent' ('optional' | 'required') and the record 'tab' they open on.
     *
     * @return array<string, array<string, mixed>>
     */
    private function getGroupDefinitions(): array
    {
        $titleOrEmail = static function (array $row): array {
            $name = trim(($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? ''));
            $email = (string) ($row['email'] ?? '');

            return $name !== '' ? [$name, $email] : [$email, ''];
        };

        $groups = [
            Lead::MODULE_NAME => [
                'label'    => __('Leads', 'bit-crm-sales-marketing-automation'),
                'route'    => 'leads',
                'listPath' => '/leads?searchTerm=',
                'format'   => $titleOrEmail,
            ],
            Contact::MODULE_NAME => [
                'label'    => __('Contacts', 'bit-crm-sales-marketing-automation'),
                'route'    => 'contacts',
                'listPath' => '/contacts?searchTerm=',
                'format'   => $titleOrEmail,
            ],
            Company::MODULE_NAME => [
                'label'    => __('Companies', 'bit-crm-sales-marketing-automation'),
                'route'    => 'companies',
                'listPath' => '/companies?searchTerm=',
                'format'   => static fn (array $row) => [(string) $row['name'], (string) (($row['website'] ?? '') ?: ($row['industry'] ?? ''))],
            ],
            Deal::MODULE_NAME => [
                'label'    => __('Deals', 'bit-crm-sales-marketing-automation'),
                'route'    => 'deals',
                'listPath' => '/deals?searchTerm=',
                'format'   => static fn (array $row) => [(string) $row['name'], (string) ($row['email'] ?? '')],
            ],
            Invoice::MODULE_NAME => [
                'label'  => __('Invoices', 'bit-crm-sales-marketing-automation'),
                'route'  => 'invoices',
                'model'  => Invoice::class,
                'select' => 't.id, t.invoice_prefix, t.status, d.name AS deal_name',
                'join'   => 'LEFT JOIN ' . Config::withDBPrefix('deals') . " d ON t.module = 'deal' AND d.id = t.entity_id",
                'match'  => ["CONCAT(t.invoice_prefix, '-', t.id)", 'd.name'],
                'where'  => 't.is_trash = 0',
                'format' => static fn (array $row) => [
                    $row['invoice_prefix'] . '-' . $row['id'],
                    implode(' · ', array_filter([(string) $row['deal_name'], ucwords(str_replace('_', ' ', (string) $row['status']))])),
                ],
            ],
            'task'    => $this->getActivityGroup('task', __('Tasks', 'bit-crm-sales-marketing-automation'), '/tasks?search='),
            'meeting' => $this->getActivityGroup('meeting', __('Meetings', 'bit-crm-sales-marketing-automation'), '/meetings?search='),
            'call'    => $this->getActivityGroup('call', __('Calls', 'bit-crm-sales-marketing-automation'), '/calls?search='),
            'note'    => [
                'label'      => __('Notes', 'bit-crm-sales-marketing-automation'),
                'capability' => 'bit_crm_note_view',
                'scopeOnly'  => true,
                'model'      => Note::class,
                'select'     => 't.id, t.title, t.module, t.entity_id',
                'match'      => ['t.title', 't.details'],
                // A note only lives on a record, and opens there, so it needs one the user can view.
                'parent' => 'required',
                'tab'    => 'notes',
                'format' => static fn (array $row) => [(string) $row['title'], ucfirst((string) $row['module'])],
            ],
        ];

        return Hooks::applyFilter(HookKeys::GLOBAL_SEARCH_GROUPS, $groups);
    }

    /**
     * @return array<string, mixed>
     */
    private function getActivityGroup(string $type, string $label, string $listPath): array
    {
        return [
            'label'      => $label,
            'capability' => 'bit_crm_activity_view',
            'scopeOnly'  => true,
            'model'      => Activity::class,
            'select'     => 't.id, t.title, t.module, t.entity_id, t.is_completed',
            // The same columns the activity list pages search, so "See all" agrees.
            'match'    => ['t.title', 't.details'],
            'where'    => "t.type = '{$type}'",
            'parent'   => 'optional',
            'tab'      => $type . 's',
            'listPath' => $listPath,
            'format'   => static fn (array $row) => [(string) $row['title'], ucfirst((string) $row['module'])],
        ];
    }

    /**
     * Record modules among the groups (anything registered as a module and given a detail
     * route, pro's products included) that the user may view. Having activity or note access
     * must not reveal the titles of, say, contacts they cannot open.
     *
     * @param array<string, array<string, mixed>> $groups
     *
     * @return array<string, array{route: string, table: string}>
     */
    private function getViewableParents(array $groups): array
    {
        $parents = [];

        foreach ($groups as $key => $group) {
            if (!isset($group['route']) || !ModuleService::isValidModule($key) || !ModuleService::canViewModule($key)) {
                continue;
            }

            $model = ModuleService::getModelInstanceByModule($key);

            if (\is_object($model)) {
                $parents[$key] = ['route' => $group['route'], 'table' => $model->getTable()];
            }
        }

        return $parents;
    }

    /**
     * Activities and notes are shown only on a record the user may view that is still
     * live: one in the trash, or a lead already converted, takes them out of search too.
     */
    private function getLiveParentCondition(): string
    {
        $checks = [];

        foreach ($this->parents as $module => $parent) {
            $live = $module === Lead::MODULE_NAME ? 'p.is_trash = 0 AND p.is_converted = 0' : 'p.is_trash = 0';
            $checks[] = "(t.module = '" . esc_sql($module) . "' AND EXISTS (SELECT 1 FROM {$parent['table']} p WHERE p.id = t.entity_id AND {$live}))";
        }

        return $checks === [] ? '1 = 0' : '(' . implode(' OR ', $checks) . ')';
    }

    /**
     * Record modules use their list page's search service, found the way the rest of the
     * plugin finds it; other groups bring their own through 'service'.
     *
     * @param array<string, mixed> $group
     *
     * @return array{0: array<int, mixed>, 1: int} the rows to rank, and the total match count
     */
    private function getServiceMatches(string $key, array $group, string $term, int $recordId): array
    {
        $args = [
            'page'       => 1,
            'perPage'    => self::RANK_WINDOW,
            'offset'     => 0,
            'searchTerm' => $recordId > 0 ? '' : $term,
            'ids'        => $recordId > 0 ? [$recordId] : [],
            'sortBy'     => 'id',
            'sortOrder'  => 'desc',
        ];

        $found = isset($group['service']) ? $group['service']()->search($args) : EntityFactory::module($key)->search($args);

        return [$found['data'] ?? [], (int) ($found['total'] ?? 0)];
    }

    /**
     * Counts only when the window is full; otherwise the rows read are all there are.
     *
     * @param array<string, mixed> $group
     *
     * @return array{0: array<int, mixed>, 1: int} the rows to rank, and the total match count
     */
    private function getQueryMatches(array $group, string $term, int $recordId): array
    {
        $table = (new $group['model']())->getTable();
        $join = $group['join'] ?? '';
        $conditions = isset($group['where']) ? [$group['where']] : [];

        if (isset($group['parent'])) {
            $live = $this->getLiveParentCondition();
            $conditions[] = $group['parent'] === 'required' ? $live : "(COALESCE(t.entity_id, 0) = 0 OR {$live})";
        }

        if ($recordId > 0) {
            $conditions[] = 't.id = %d';
            $bindings = [$recordId];
        } else {
            $conditions[] = '(' . implode(' OR ', array_map(fn ($column) => "{$column} LIKE %s", $group['match'])) . ')';
            $bindings = array_fill(0, \count($group['match']), '%' . Connection::esc_like($term) . '%');
        }

        $from = "FROM {$table} t {$join} WHERE " . implode(' AND ', $conditions);
        $limit = self::RANK_WINDOW;

        $rows = $group['model']::raw("SELECT {$group['select']} {$from} ORDER BY t.id DESC LIMIT {$limit}", $bindings);
        $rows = \is_array($rows) ? $rows : [];

        if (\count($rows) < self::RANK_WINDOW) {
            return [$rows, \count($rows)];
        }

        $totalRow = $group['model']::raw("SELECT COUNT(*) AS total {$from}", $bindings);

        return [$rows, (int) ($totalRow[0]->total ?? \count($rows))];
    }

    /**
     * Best title match first: exact, then starts with the term, then has a word that
     * does, then contains it anywhere, then matched only on another field (an email,
     * a code). Ties keep the newest-first order the rows arrived in.
     *
     * @param array<int, array<string, mixed>> $items
     *
     * @return array<int, array<string, mixed>>
     */
    private function rankItems(array $items, string $term): array
    {
        $needle = mb_strtolower($term);
        $wordStart = '/(^|[^\p{L}\p{N}])' . preg_quote($needle, '/') . '/u';

        $scores = array_map(
            function (array $item) use ($needle, $wordStart): int {
                $title = mb_strtolower($item['title']);

                return match (true) {
                    $title === $needle                   => 0,
                    str_starts_with($title, $needle)     => 1,
                    preg_match($wordStart, $title) === 1 => 2,
                    str_contains($title, $needle)        => 3,
                    default                              => 4,
                };
            },
            $items
        );

        // Stable on equal scores, which keeps the incoming newest-first order.
        array_multisort($scores, SORT_ASC, SORT_NUMERIC, array_keys($items), SORT_ASC, $items);

        return $items;
    }

    /**
     * @param array<string, mixed> $group
     * @param array<string, mixed> $row
     *
     * @return array{id: int, path: string, subtitle: string, title: string}
     */
    private function formatItem(array $group, array $row): array
    {
        $id = (int) $row['id'];
        [$title, $subtitle] = $group['format']($row);
        $path = isset($group['parent']) ? $this->getParentPath($group, $row) : '/' . $group['route'] . '/details/' . $id;

        return ['id' => $id, 'path' => $path, 'subtitle' => (string) $subtitle, 'title' => (string) $title];
    }

    /**
     * Activities and notes have no page of their own. They open on their tab of the
     * record they belong to, filtered to their title (each tab reads `search`); a
     * standalone activity opens on its list page.
     *
     * @param array<string, mixed> $group
     * @param array<string, mixed> $row
     */
    private function getParentPath(array $group, array $row): string
    {
        $route = $this->parents[$row['module']]['route'] ?? null;
        $title = rawurlencode((string) $row['title']);

        if ($route && !empty($row['entity_id'])) {
            return '/' . $route . '/details/' . (int) $row['entity_id'] . '?tab=' . $group['tab'] . '&search=' . $title;
        }

        return $group['listPath'] . $title;
    }
}
