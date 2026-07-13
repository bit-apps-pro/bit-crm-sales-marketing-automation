<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Helpers\SQLHelper;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Model\LineItem;
use BitApps\Crm\src\Capability;
use DateTimeImmutable;
use Throwable;

class DashboardService
{
    private const TOP_LEAD_SOURCES_LIMIT = 4;

    private const TOP_PRODUCTS_LIMIT = 3;

    private const PENDING_ACTIVITY_TYPES = ['meeting', 'call', 'task'];

    private const PENDING_ACTIVITY_TOTAL_LIMIT = 100;

    public function getLeadCountBySource(): array
    {
        if (!Capability::check('bit_crm_lead_view')) {
            return [];
        }

        $leadCountBySource = Lead::select('lead_source')
            ->selectRaw('COUNT(*) as total')
            ->where('is_trash', 0)
            ->where('is_converted', 0)
            ->groupBy('lead_source')
            ->orderBy('total')
            ->desc()
            ->take(self::TOP_LEAD_SOURCES_LIMIT)
            ->get();

        if (empty($leadCountBySource)) {
            return [];
        }

        return $leadCountBySource->toArray();
    }

    public function getTopProductsByQuantity(): array
    {
        if (!Capability::check('bit_crm_product_view')) {
            return [];
        }

        $topProductsByQuantity = LineItem::select('product_id')
            ->selectRaw('MAX(product_name) as product_name')
            ->selectRaw('SUM(quantity) as total, SUM(SUM(quantity)) OVER () as grand_total')
            ->whereIn('module', [Deal::MODULE_NAME, Invoice::MODULE_NAME])
            ->where('product_source', LineItem::SOURCE_PRODUCT)
            ->groupBy('product_id')
            ->orderBy('total')
            ->desc()
            ->take(self::TOP_PRODUCTS_LIMIT)
            ->get();

        if (empty($topProductsByQuantity)) {
            return [];
        }

        return $topProductsByQuantity->toArray();
    }

    public function getDealPipeline(string $startDate, string $endDate): array
    {
        if (!Capability::check('bit_crm_deal_view')) {
            return [];
        }

        $pipelineStages = Deal::selectRaw('SUM(CAST(home_currency_amount AS DECIMAL(17, 6))) as amount, COUNT(*) as count')
            ->select('stage')
            ->where('is_trash', 0)
            ->whereRaw(SQLHelper::utcToSiteDate('created_at') . ' BETWEEN %s AND %s', [$startDate, $endDate])
            ->groupBy('stage')
            ->get();

        if (empty($pipelineStages)) {
            return [];
        }

        $dealsPipelineByStage = [];

        foreach ($pipelineStages->toArray() as $pipelineStage) {
            $stageKey = $pipelineStage['stage'] ?? '';

            if (empty($stageKey)) {
                continue;
            }

            $dealsPipelineByStage[$stageKey] = $pipelineStage;
        }

        $stages = (new DealStageService())->getAllStages(DealStageService::STATUS_ACTIVE);
        $dealsPipeline = [];

        foreach ($stages as $stageKey => $stage) {
            if (!isset($dealsPipelineByStage[$stageKey])) {
                continue;
            }

            $dealsPipeline[] = [
                'stage'  => $stageKey,
                'amount' => $dealsPipelineByStage[$stageKey]['amount'] ?? '0',
                'count'  => $dealsPipelineByStage[$stageKey]['count'] ?? '0',
                'name'   => $stage['name'] ?? $stageKey,
                'color'  => $stage['color'] ?? null,
            ];
        }

        return $dealsPipeline;
    }

    public function getPendingActivities(): array
    {
        $activitiesTable = Config::withDBPrefix('activities');
        $wpUsersTable = Config::get('WP_DB_PREFIX') . 'users';
        $userId = (int) get_current_user_id();
        $activityTypes = "'" . implode("','", self::PENDING_ACTIVITY_TYPES) . "'";

        $grouped = array_fill_keys(self::PENDING_ACTIVITY_TYPES, ['items' => [], 'total' => 0]);

        $activities = Activity::raw(
            "SELECT id, type, title, details, due_date, assignee
             FROM (
                 SELECT a.id, a.type, a.title, a.details, a.due_date,
                        u.display_name AS assignee,
                        ROW_NUMBER() OVER (PARTITION BY a.type ORDER BY a.due_date ASC) AS rn
                 FROM {$activitiesTable} a
                 LEFT JOIN {$wpUsersTable} u ON u.ID = a.assigned_to
                 WHERE a.is_completed = false
                   AND a.assigned_to = {$userId}
                   AND a.type IN ({$activityTypes})
             ) ranked
             WHERE rn <= 2
             ORDER BY type, due_date ASC"
        ) ?: [];

        $totals = $this->getPendingActivityTotals($activitiesTable, $userId);

        if (empty($totals)) {
            return $grouped;
        }

        foreach ($totals as $row) {
            if (isset($grouped[$row->type])) {
                $grouped[$row->type]['total'] = (int) $row->total;
            }
        }

        foreach ($activities as $activity) {
            if (isset($grouped[$activity->type])) {
                $grouped[$activity->type]['items'][] = $activity;
            }
        }

        return $grouped;
    }

    public function getStats(): array
    {
        $monthRanges = $this->getMonthComparisonRanges();
        $siteDate = SQLHelper::utcToSiteDate('created_at');
        $monthlyCondition = "{$siteDate} BETWEEN %s AND %s";

        $statEntities = array_filter(
            $this->dashboardStatEntities(),
            fn ($entity) => Capability::check($entity['capability'])
        );

        if (empty($statEntities)) {
            return $this->emptyStats();
        }

        [$columns, $bindings] = $this->buildStatsQueryParts($statEntities, $monthlyCondition, $monthRanges);

        try {
            $result = Lead::raw('SELECT ' . implode(', ', $columns), $bindings);
        } catch (Throwable) {
            return $this->emptyStats();
        }

        $row = !empty($result) ? reset($result) : null;

        if (!$row) {
            return $this->emptyStats();
        }

        return $this->prepareStats($row, $statEntities);
    }

    public function getInvoiceStatusOverview(): array
    {
        if (!Capability::check('bit_crm_invoice_view')) {
            return [];
        }

        $rows = Invoice::select('status')
            ->selectRaw('COUNT(*) as total, SUM(COUNT(*)) OVER () as grand_total')
            ->where('is_trash', 0)
            ->groupBy('status')
            ->orderBy('total')
            ->desc()
            ->get();

        return $rows ? $rows->toArray() : [];
    }

    private function getPendingActivityTotals(string $activitiesTable, int $userId): array
    {
        $queries = [];
        $bindings = [];

        foreach (self::PENDING_ACTIVITY_TYPES as $type) {
            $queries[] = "SELECT %s AS type, COUNT(*) AS total
                FROM (
                    SELECT id FROM {$activitiesTable}
                    WHERE is_completed = false
                      AND assigned_to = %d
                      AND type = %s
                    LIMIT %d
                ) {$type}_limited";

            array_push($bindings, $type, $userId, $type, self::PENDING_ACTIVITY_TOTAL_LIMIT);
        }

        return Activity::raw(implode(' UNION ALL ', $queries), $bindings) ?: [];
    }

    private function prepareStats($row, array $statEntities): array
    {
        $result = $this->emptyStats();

        foreach ($statEntities as $entity) {
            $prefix = $entity['prefix'];
            $total = "{$prefix}_total";
            $currentMonth = "{$prefix}_current_month";
            $previousMonth = "{$prefix}_previous_month";

            $result[$prefix] = $this->formatStat((int) $row->{$total}, (int) $row->{$currentMonth}, (int) $row->{$previousMonth});
        }

        return $result;
    }

    private function dashboardStatEntities(): array
    {
        return [
            [
                'capability' => 'bit_crm_lead_view',
                'prefix'     => 'leads',
                'table'      => Config::withDBPrefix('leads'),
                'where'      => 'is_trash = 0 AND is_converted = 0',
            ],
            [
                'capability' => 'bit_crm_contact_view',
                'prefix'     => 'contacts',
                'table'      => Config::withDBPrefix('contacts'),
                'where'      => 'is_trash = 0',
            ],
            [
                'capability' => 'bit_crm_deal_view',
                'prefix'     => 'deals',
                'table'      => Config::withDBPrefix('deals'),
                'where'      => 'is_trash = 0',
            ],
            [
                'capability' => 'bit_crm_company_view',
                'prefix'     => 'companies',
                'table'      => Config::withDBPrefix('companies'),
                'where'      => 'is_trash = 0',
            ],
            [
                'capability' => 'bit_crm_invoice_view',
                'prefix'     => 'invoices',
                'table'      => Config::withDBPrefix('invoices'),
                'where'      => 'is_trash = 0',
            ],
        ];
    }

    private function buildStatsQueryParts(array $statEntities, string $monthlyCondition, array $monthRanges): array
    {
        $columns = [];
        $bindings = [];

        foreach ($statEntities as $entity) {
            $table = $entity['table'];
            $prefix = $entity['prefix'];
            $where = $entity['where'];

            $columns[] = "COALESCE((SELECT COUNT(*) FROM {$table} WHERE {$where}), 0) AS {$prefix}_total";
            $columns[] = "COALESCE((SELECT COUNT(*) FROM {$table} WHERE {$where} AND {$monthlyCondition}), 0) AS {$prefix}_current_month";
            $columns[] = "COALESCE((SELECT COUNT(*) FROM {$table} WHERE {$where} AND {$monthlyCondition}), 0) AS {$prefix}_previous_month";

            $bindings[] = $monthRanges['currentStart'];
            $bindings[] = $monthRanges['currentEnd'];
            $bindings[] = $monthRanges['previousStart'];
            $bindings[] = $monthRanges['previousEnd'];
        }

        return [$columns, $bindings];
    }

    private function getMonthComparisonRanges(): array
    {
        $now = new DateTimeImmutable('now', wp_timezone());
        $previousMonthStart = $now->modify('first day of last month');

        // Compare the current month-to-date against the SAME day span of the
        // previous month so the comparison is like-for-like (e.g. 1st-15th vs
        // 1st-15th), not month-to-date vs a full previous month. The previous
        // month's end day is clamped to its own length so day 31 maps safely to
        // e.g. Feb 28.
        $currentDay = (int) $now->format('j');
        $previousMonthLastDay = (int) $previousMonthStart->format('t');
        $previousEndDay = min($currentDay, $previousMonthLastDay);

        return [
            'currentStart'  => $now->format('Y-m-01'),
            'currentEnd'    => $now->format('Y-m-d'),
            'previousStart' => $previousMonthStart->format('Y-m-01'),
            'previousEnd'   => $previousMonthStart->format('Y-m-') . \sprintf('%02d', $previousEndDay),
        ];
    }

    private function emptyStats(): array
    {
        $empty = ['total' => 0, 'percentageChange' => 0.0, 'trend' => 'flat'];

        return [
            'leads'     => $empty,
            'contacts'  => $empty,
            'deals'     => $empty,
            'companies' => $empty,
            'invoices'  => $empty,
        ];
    }

    private function formatStat(int $total, int $currentMonth, int $previousMonth): array
    {
        if ($previousMonth > 0) {
            $percentageChange = round((($currentMonth - $previousMonth) / $previousMonth) * 100, 1);
        } else {
            $percentageChange = $currentMonth > 0 ? 100.0 : 0.0;
        }

        if ($percentageChange > 0) {
            $trend = 'up';
        } elseif ($percentageChange < 0) {
            $trend = 'down';
        } else {
            $trend = 'flat';
        }

        return [
            'total'            => $total,
            'percentageChange' => abs($percentageChange),
            'trend'            => $trend,
        ];
    }
}
