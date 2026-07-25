<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;
use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\src\ActivityLogHandler;

class Company extends Model
{
    public const MODULE_NAME = 'company';

    public const FOREIGN_KEY = 'company_id';

    public const IMPORT_PREFIX = 'company_import';

    public const DUPLICATE_SKIP = 'skip';

    public const DUPLICATE_UPDATE = 'update';

    public const DUPLICATE_CREATE = 'create';

    public const CSV_FIELDS_PREFIX = 'csv_fields_';

    public const SETTINGS_KEYS = [
        'FIELDS'                => 'company_fields_settings',
        'FIELDS_ORDER'          => 'company_fields_order',
        'TABLE_VISIBLE_COLUMNS' => 'company_table_visible_columns',
        'COLUMNS_ORDER'         => 'company_table_columns_order',
        'COLUMNS_SETTINGS'      => 'company_columns_settings',
    ];

    public const RELATED_MODELS = [
        TagEntity::class,
        ActivityLog::class,
        Activity::class,
        Attachment::class,
        Note::class,
        Link::class,
        Trash::class,
    ];

    public const STATIC_SEARCHABLE_FIELDS = ['name', 'phone', 'website', 'industry'];

    protected $table = 'companies';

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'owner_id',
        'parent_id',
        'name',
        'phone',
        'website',
        'fax',
        'account_number',
        'account_site',
        'ticker_symbol',
        'ownership',
        'employees_number',
        'industry',
        'currency',
        'annual_revenue',
        'type',
        'rating',
        'billing_address_line_1',
        'billing_address_line_2',
        'billing_city',
        'billing_county',
        'billing_state',
        'billing_zip',
        'billing_country',
        'shipping_address_line_1',
        'shipping_address_line_2',
        'shipping_city',
        'shipping_county',
        'shipping_state',
        'shipping_zip',
        'shipping_country',
        'description',
        'status',
        'is_trash',
        'reference_uuid',
        'import_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'reference_uuid'   => 'stringUuid',
        'created_at'       => 'siteTimeZone',
        'updated_at'       => 'siteTimeZone',
        'annual_revenue'   => 'float',
        'employees_number' => 'integer',
        'status'           => 'bool',
        'is_trash'         => 'bool',
    ];

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
