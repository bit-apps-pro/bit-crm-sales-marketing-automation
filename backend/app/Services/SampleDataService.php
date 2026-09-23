<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\Slug;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Model\Link;
use BitApps\Crm\Model\Note;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Model\TagEntity;
use BitApps\Crm\src\StaticData\CurrencyHelper;
use BitApps\Crm\src\StaticData\SampleData;
use RuntimeException;
use Throwable;

/**
 * Seeds and removes the one-time sample data set, and tracks the offer that
 * lets a new install choose it.
 *
 * Seeding goes straight through the models, so the service-level
 * `bit_crm/<module>_created` hooks never fire. Every seeded id is recorded so
 * removal deletes exactly what was seeded.
 */
class SampleDataService
{
    /**
     * One autoloaded plugin option: `status`, plus `ids` per module while
     * sample data exists. Absent until the first decision, which is `pending`.
     */
    public const OPTION = 'sample_data';

    /** No decision yet: the app shows the one-time popup. */
    public const STATUS_PENDING = 'pending';

    /** The user cancelled or chose to start from scratch. */
    public const STATUS_DISMISSED = 'dismissed';

    /** Sample data is present: the app shows the dashboard notice and the removal tab. */
    public const STATUS_SEEDED = 'seeded';

    /** Sample data was seeded and later removed. */
    public const STATUS_REMOVED = 'removed';

    /** Parent modules in a deletion-safe order: referencing rows go first. */
    private const PARENT_MODULES = [
        Deal::MODULE_NAME,
        Lead::MODULE_NAME,
        Contact::MODULE_NAME,
        Company::MODULE_NAME,
    ];

    private const CHILD_MODULES = [
        Activity::MODULE_NAME,
        Note::MODULE_NAME,
        Link::MODULE_NAME,
    ];

    private const MODELS = [
        Company::MODULE_NAME  => Company::class,
        Contact::MODULE_NAME  => Contact::class,
        Lead::MODULE_NAME     => Lead::class,
        Deal::MODULE_NAME     => Deal::class,
        Activity::MODULE_NAME => Activity::class,
        Note::MODULE_NAME     => Note::class,
        Link::MODULE_NAME     => Link::class,
        Tag::MODULE_NAME      => Tag::class,
    ];

    private int $userId;

    private string $now = '';

    private string $currency = '';

    /** @var array<string, array<string, int>> module => [fixture key => id]; for tags, [module => Sample tag id] */
    private array $keyMap = [];

    /** @var array<string, int[]> module => seeded ids */
    private array $ids = [];

    /** @var array<string, array<int, string>> module => [id => GMT datetime] */
    private array $backdates = [];

    public function __construct()
    {
        $this->userId = (int) get_current_user_id();
    }

    public function exists(): bool
    {
        return $this->getStatus() === self::STATUS_SEEDED;
    }

    /**
     * Lifecycle status, stored and reported with the same vocabulary.
     */
    public function getStatus(): string
    {
        $status = $this->getOption()['status'] ?? null;

        return \is_string($status) && $status !== '' ? $status : self::STATUS_PENDING;
    }

    public function isPending(): bool
    {
        return $this->getStatus() === self::STATUS_PENDING;
    }

    public function dismiss(): void
    {
        Config::updateOption(self::OPTION, ['status' => self::STATUS_DISMISSED], true);
    }

    /**
     * Inserts the whole fixture inside one transaction and records the ids.
     *
     * @throws RuntimeException when the offer was already decided or an insert is rejected
     */
    public function seed(): void
    {
        if (!$this->isPending()) {
            throw new RuntimeException('Sample data can only be added once.');
        }

        $this->now = current_time('mysql', true);
        $this->currency = CurrencyHelper::getHomeCurrency();
        $this->keyMap = [];
        $this->ids = [];
        $this->backdates = [];

        Connection::startTransaction();

        try {
            $this->seedTags();
            $this->seedParents();
            $this->seedChildren();
            $this->attachTags();
            $this->applyBackdates();
            Connection::commit();
        } catch (Throwable $th) {
            Connection::rollback();

            throw $th;
        }

        Config::updateOption(self::OPTION, ['status' => self::STATUS_SEEDED, 'ids' => $this->ids], true);
    }

    /**
     * Permanently deletes every seeded row, its related rows and the seeded
     * tags inside one transaction, then forgets the ids.
     *
     * @throws RuntimeException when nothing is tracked
     */
    public function remove(): void
    {
        if (!$this->exists()) {
            throw new RuntimeException('There is no sample data to remove.');
        }

        $ids = $this->getSeededIds();

        Connection::startTransaction();

        try {
            foreach (self::PARENT_MODULES as $module) {
                $this->deleteEntitiesWithRelations(self::MODELS[$module], $ids[$module] ?? []);
            }

            // Anything the user re-attached to a real record.
            foreach (self::CHILD_MODULES as $module) {
                $this->deleteWhere(self::MODELS[$module], 'id', $ids[$module] ?? []);
            }

            $this->deleteWhere(TagEntity::class, 'tag_id', $ids[Tag::MODULE_NAME] ?? []);
            $this->deleteWhere(Tag::class, 'id', $ids[Tag::MODULE_NAME] ?? []);

            Connection::commit();
        } catch (Throwable $th) {
            Connection::rollback();

            throw $th;
        }

        Config::updateOption(self::OPTION, ['status' => self::STATUS_REMOVED], true);
    }

    // ---------------------------------------------------------------- seeding

    /**
     * One Sample tag per parent module. A user-created tag of the same name is
     * reused and never tracked, so removal leaves it alone.
     */
    private function seedTags(): void
    {
        $slug = Slug::generate(SampleData::TAG_TITLE);

        foreach (self::PARENT_MODULES as $module) {
            $existing = Tag::findOne(['slug' => $slug, 'module' => $module]);

            if ($existing) {
                $this->keyMap[Tag::MODULE_NAME][$module] = (int) $existing->id;

                continue;
            }

            $tag = $this->insert(Tag::class, [
                'title'      => SampleData::TAG_TITLE,
                'slug'       => $slug,
                'module'     => $module,
                'created_by' => $this->userId,
            ]);

            $this->keyMap[Tag::MODULE_NAME][$module] = (int) $tag->id;
            $this->ids[Tag::MODULE_NAME][] = (int) $tag->id;
        }
    }

    private function seedParents(): void
    {
        $owner = ['owner_id' => $this->userId, 'created_by' => $this->userId];

        foreach (SampleData::companies() as $key => $company) {
            $this->seedRecord(Company::MODULE_NAME, $key, $company, $owner + [
                'currency'       => $this->currency,
                'reference_uuid' => Uuid::generate(),
            ]);
        }

        foreach (SampleData::contacts() as $key => $contact) {
            $this->seedRecord(Contact::MODULE_NAME, $key, $contact, $owner + [
                'company_id'     => $this->resolve(Company::MODULE_NAME, $contact['company']),
                'currency'       => $this->currency,
                'reference_uuid' => Uuid::generate(),
            ]);
        }

        foreach (SampleData::leads() as $key => $lead) {
            $this->seedRecord(Lead::MODULE_NAME, $key, $lead, $owner + ['reference_uuid' => Uuid::generate()]);
        }

        [$openStages, $closedStages] = $this->resolveStages();

        foreach (SampleData::deals() as $key => $deal) {
            $stage = isset($deal['closed'])
                ? ($closedStages[$deal['closed']] ?? end($openStages))
                : $openStages[$deal['stage_index'] % \count($openStages)];

            $this->seedRecord(Deal::MODULE_NAME, $key, $deal, $owner + [
                'home_currency_amount' => $deal['amount'],
                'currency'             => $this->currency,
                'stage'                => $stage['key'],
                'probability'          => $stage['probability'] ?? null,
                'contact_id'           => $this->resolve(Contact::MODULE_NAME, $deal['contact']),
                'company_id'           => $this->resolve(Company::MODULE_NAME, $deal['company']),
                'reference_uuid'       => Uuid::generate(),
                'closed_at'            => isset($deal['closed_days_ago']) ? $this->gmtDaysAgo($deal['closed_days_ago']) : null,
            ]);
        }
    }

    private function seedChildren(): void
    {
        foreach (SampleData::activities() as $activity) {
            $this->seedRecord(Activity::MODULE_NAME, null, $activity, [
                'due_date'     => $this->gmtDaysAgo(-$activity['due_in_days'], 10),
                'is_completed' => !empty($activity['is_completed']),
                'assigned_to'  => $this->userId,
                'created_by'   => $this->userId,
            ] + $this->resolveEntity($activity['entity']));
        }

        foreach (SampleData::notes() as $note) {
            $this->seedRecord(Note::MODULE_NAME, null, $note, ['created_by' => $this->userId] + $this->resolveEntity($note['entity']));
        }

        foreach (SampleData::links() as $link) {
            $this->seedRecord(Link::MODULE_NAME, null, $link, ['created_by' => $this->userId] + $this->resolveEntity($link['entity']));
        }
    }

    /**
     * Inserts one fixture record: fixture-only keys are stripped, `$extra`
     * wins over fixture values, and the row is tracked and backdated.
     */
    private function seedRecord(string $module, ?string $key, array $record, array $extra): void
    {
        $daysAgo = $record['days_ago'];
        unset($record['days_ago'], $record['company'], $record['contact'], $record['entity'], $record['closed'], $record['closed_days_ago'], $record['stage_index'], $record['due_in_days'], $record['is_completed']);

        $model = $this->insert(self::MODELS[$module], $extra + $record);
        $id = (int) $model->id;

        if ($key !== null) {
            $this->keyMap[$module][$key] = $id;
        }

        $this->ids[$module][] = $id;
        $this->backdates[$module][$id] = $this->gmtDaysAgo($daysAgo);
    }

    /**
     * Marks every parent record with the Sample tag in a single multi-row insert.
     */
    private function attachTags(): void
    {
        $rows = [];

        foreach (self::PARENT_MODULES as $module) {
            foreach ($this->keyMap[$module] ?? [] as $entityId) {
                $rows[] = ['entity_id' => $entityId, 'tag_id' => $this->keyMap[Tag::MODULE_NAME][$module], 'module' => $module];
            }
        }

        $this->insert(TagEntity::class, $rows);
    }

    /**
     * The ORM stamps created_at itself and refuses it on update, so backdating
     * is a direct write after the inserts.
     */
    private function applyBackdates(): void
    {
        foreach ($this->backdates as $module => $rows) {
            $model = self::MODELS[$module];
            $table = (new $model())->getTable();

            foreach ($rows as $id => $datetime) {
                $model::raw("UPDATE {$table} SET created_at = %s, updated_at = %s WHERE id = %d", [$datetime, $datetime, $id]);
            }
        }
    }

    // ---------------------------------------------------------------- removal

    private function deleteEntitiesWithRelations(string $model, array $ids): void
    {
        if (empty($ids)) {
            return;
        }

        $this->deleteWhere($model, 'id', $ids);

        foreach (Hooks::applyFilter(HookKeys::ENTITY_RELATED_MODELS, $model::RELATED_MODELS) as $relatedModel) {
            $query = $relatedModel::where('module', $model::MODULE_NAME)->whereIn('entity_id', $ids);

            if ($query->count()) {
                $query->delete();
            }
        }
    }

    private function deleteWhere(string $model, string $column, array $ids): void
    {
        if (empty($ids)) {
            return;
        }

        $query = $model::whereIn($column, $ids);

        if ($query->count()) {
            $query->delete();
        }
    }

    // ---------------------------------------------------------------- helpers

    private function getOption(): array
    {
        $value = Config::getOption(self::OPTION, null);

        return \is_array($value) ? $value : [];
    }

    /**
     * @return array<string, int[]> module => seeded ids
     */
    private function getSeededIds(): array
    {
        return array_map(fn ($moduleIds) => array_map('intval', (array) $moduleIds), (array) ($this->getOption()['ids'] ?? []));
    }

    /**
     * @return array{0: array<int, array>, 1: array<string, array>} open stages by position, closed stages by won|lost
     */
    private function resolveStages(): array
    {
        $stages = (new DealStageService())->getAllStages(DealStageService::STATUS_ACTIVE);
        $open = [];
        $closed = [];

        foreach ($stages as $stage) {
            $category = $stage['deal_category'] ?? 'open';

            if ($category === 'closed_won') {
                $closed['won'] ??= $stage;
            } elseif ($category === 'closed_lost') {
                $closed['lost'] ??= $stage;
            } else {
                $open[] = $stage;
            }
        }

        return [$open ?: array_values($stages), $closed];
    }

    /**
     * Inserts one row, or a list of rows in a single statement.
     *
     * @throws RuntimeException the ORM returns a falsy value instead of throwing on a rejected write
     *
     * @return object the inserted model, or a collection for a list of rows
     */
    private function insert(string $model, array $attributes)
    {
        $inserted = $model::insert($attributes);

        if (!$inserted) {
            throw new RuntimeException(esc_html("Sample data insert failed for {$model}."));
        }

        return $inserted;
    }

    private function resolve(string $module, ?string $key): ?int
    {
        if ($key === null) {
            return null;
        }

        if (!isset($this->keyMap[$module][$key])) {
            throw new RuntimeException(esc_html("Sample data fixture references unknown {$module} '{$key}'."));
        }

        return $this->keyMap[$module][$key];
    }

    /**
     * @return array{module: string, entity_id: int} for a parent fixture key
     */
    private function resolveEntity(string $key): array
    {
        foreach (self::PARENT_MODULES as $module) {
            if (isset($this->keyMap[$module][$key])) {
                return ['module' => $module, 'entity_id' => $this->keyMap[$module][$key]];
            }
        }

        throw new RuntimeException(esc_html("Sample data fixture references unknown entity '{$key}'."));
    }

    /**
     * GMT datetime the given number of days before seeding time. A small
     * deterministic hour offset keeps records from sharing one timestamp;
     * `$hour` pins the time of day instead (used for due dates).
     */
    private function gmtDaysAgo(int $days, ?int $hour = null): string
    {
        $base = strtotime($this->now) - $days * DAY_IN_SECONDS;

        if ($hour !== null) {
            return gmdate('Y-m-d', $base) . \sprintf(' %02d:00:00', $hour);
        }

        return gmdate('Y-m-d H:i:s', $base - (abs($days) % 8) * HOUR_IN_SECONDS);
    }
}
