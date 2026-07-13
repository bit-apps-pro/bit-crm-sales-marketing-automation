<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;
use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\src\ActivityLogHandler;

class Lead extends Model
{
    public const MODULE_NAME = 'lead';

    public const IMPORT_PREFIX = 'lead_import';

    public const DUPLICATE_SKIP = 'skip';

    public const DUPLICATE_UPDATE = 'update';

    public const DUPLICATE_CREATE = 'create';

    public const CSV_FIELDS_PREFIX = 'csv_fields_';

    public const SETTINGS_KEYS = [
        'FIELDS'                => 'lead_fields_settings',
        'FIELDS_ORDER'          => 'lead_fields_order',
        'TABLE_VISIBLE_COLUMNS' => 'lead_table_visible_columns',
        'COLUMNS_ORDER'         => 'lead_table_columns_order',
        'COLUMNS_SETTINGS'      => 'lead_columns_settings',
        'CONVERSION_MAPPING'    => 'lead_conversion_mapping',
    ];

    public const RELATED_MODELS = [
        TagEntity::class,
        ActivityLog::class,
        Trash::class,

        Activity::class,
        Attachment::class,
        Note::class,
        Link::class,
    ];

    public const RELATED_LIST_MODELS = [
        Activity::class,
        Attachment::class,
        Note::class,
        Link::class,
    ];

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'owner_id',
        'is_converted',
        'conversion_details',
        'title',
        'last_name',
        'first_name',
        'email',
        'phone',
        'website',
        'company_name',
        'lead_status',
        'lead_source',
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
        'industry',
        'currency',
        'annual_revenue',
        'description',
        'status',
        'is_trash',
        'reference_uuid',
        'import_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_converted'   => 'bool',
        'is_trash'       => 'bool',
        'status'         => 'bool',
        'reference_uuid' => 'stringUuid',
        'created_at'     => 'siteTimeZone',
        'updated_at'     => 'siteTimeZone',
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

        static::saved(
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
