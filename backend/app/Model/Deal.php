<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;
use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\src\ActivityLogHandler;

class Deal extends Model
{
    public const MODULE_NAME = 'deal';

    public const FOREIGN_KEY = 'deal_id';

    public const IMPORT_PREFIX = 'deal_import';

    public const DUPLICATE_SKIP = 'skip';

    public const DUPLICATE_UPDATE = 'update';

    public const DUPLICATE_CREATE = 'create';

    public const CSV_FIELDS_PREFIX = 'csv_fields_';

    public const SETTINGS_KEYS = [
        'FIELDS'                => 'deal_fields_settings',
        'FIELDS_ORDER'          => 'deal_fields_order',
        'TABLE_VISIBLE_COLUMNS' => 'deal_table_visible_columns',
        'COLUMNS_ORDER'         => 'deal_table_columns_order',
        'COLUMNS_SETTINGS'      => 'deal_columns_settings',
    ];

    public const RELATED_MODELS = [
        TagEntity::class,
        ActivityLog::class,
        Activity::class,
        Attachment::class,
        Note::class,
        Link::class,
        Trash::class,
        LineItem::class,
    ];

    public const STATIC_SEARCHABLE_FIELDS = ['name', 'description'];

    protected $table = 'deals';

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'email',
        'name',
        'company_id',
        'contact_id',
        'type',
        'lead_source',
        'currency',
        'amount',
        'home_currency_amount',
        'gross_discount_amount',
        'gross_discount_type',
        'tax_option',
        'stage',
        'probability',
        'description',
        'status',
        'reference_uuid',
        'import_id',
        'is_trash',
        'owner_id',
        'created_by',
        'updated_by',
        'closed_at',
    ];

    protected $casts = [
        'reference_uuid' => 'stringUuid',
        'created_at'     => 'siteTimeZone',
        'updated_at'     => 'siteTimeZone',
        'closed_at'      => 'siteTimeZone',
        'amount'         => 'float',
        'status'         => 'bool',
        'is_trash'       => 'bool',
    ];

    public function fill($attributes, $force = false)
    {
        if (!$force && isset($this->casts)) {
            $savedCasts = $this->casts;
            $this->casts = array_filter($this->casts, fn ($cast) => $cast !== 'siteTimeZone');

            try {
                $result = parent::fill($attributes, $force);
            } finally {
                $this->casts = $savedCasts;
            }

            return $result;
        }

        return parent::fill($attributes, $force);
    }

    protected function castToStringUuid($value)
    {
        return Uuid::toggleFormat($value);
    }

    protected function castToSiteTimeZone($value)
    {
        return get_date_from_gmt($value);
    }

    protected static function boot()
    {
        parent::boot();

        static::created(
            function ($model) {
                ActivityLogHandler::addLog(
                    ActivityLogHandler::CREATED,
                    $model->id,
                    self::MODULE_NAME
                );
            }
        );

        static::updated(
            function ($model) {
                ActivityLogHandler::addLog(
                    ActivityLogHandler::UPDATED,
                    $model->id,
                    self::MODULE_NAME
                );
            }
        );

        static::deleted(
            function ($model) {
                ActivityLogHandler::addLog(
                    ActivityLogHandler::DELETED,
                    $model->id,
                    self::MODULE_NAME
                );
            }
        );
    }
}
