<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;
use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\src\ActivityLogHandler;

class Contact extends Model
{
    public const MODULE_NAME = 'contact';

    public const FOREIGN_KEY = 'contact_id';

    public const IMPORT_PREFIX = 'contact_import';

    public const DUPLICATE_SKIP = 'skip';

    public const DUPLICATE_UPDATE = 'update';

    public const DUPLICATE_CREATE = 'create';

    public const CSV_FIELDS_PREFIX = 'csv_fields_';

    public const SETTINGS_KEYS = [
        'FIELDS'                     => 'contact_fields_settings',
        'FIELDS_ORDER'               => 'contact_fields_order',
        'TABLE_VISIBLE_COLUMNS'      => 'contact_table_visible_columns',
        'COLUMNS_ORDER'              => 'contact_table_columns_order',
        'COLUMNS_SETTINGS'           => 'contact_columns_settings',
        'DEAL_TABLE_COLUMNS_ORDER'   => 'contact_deal_table_columns_order',
        'DEAL_TABLE_VISIBLE_COLUMNS' => 'contact_deal_table_visible_columns',
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

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'owner_id',
        'company_id',
        'parent_id',
        'title',
        'last_name',
        'first_name',
        'email',
        'phone',
        'mobile',
        'fax',
        'department',
        'assistant',
        'assistant_phone',
        'lead_source',
        'date_of_birth',
        'secondary_email',
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
        'currency',
        'description',
        'status',
        'is_trash',
        'reference_uuid',
        'import_id',
        'created_by',
        'updated_by',
        'created_from',
    ];

    protected $casts = [
        'reference_uuid' => 'stringUuid',
        'created_at'     => 'siteTimeZone',
        'updated_at'     => 'siteTimeZone',
        'is_trash'       => 'bool',
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
