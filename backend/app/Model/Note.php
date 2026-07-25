<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;
use BitApps\Crm\src\ActivityLogHandler;

class Note extends Model
{
    public const MODULE_NAME = 'note';

    public const SORT_RECENT_FIRST = 'recent_first';

    public const SORT_RECENT_LAST = 'recent_last';

    protected $table = 'notes';

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'title',
        'details',
        'attachments',
        'entity_id',
        'module',
        'created_by',
        'updated_by',
        'attributes',
        'is_shared',
        'type',
    ];

    protected $casts = [
        'is_shared'   => 'bool',
        'attachments' => 'array',
        'created_at'  => 'siteTimeZone',
        'updated_at'  => 'siteTimeZone',
    ];

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
                    $model->entity_id,
                    $model->module,
                    'Note Created',
                    self::logDetails(ActivityLogHandler::CREATED)
                );
            }
        );

        static::updated(
            function ($model) {
                ActivityLogHandler::addLog(
                    ActivityLogHandler::UPDATED,
                    $model->entity_id,
                    $model->module,
                    'Note Updated',
                    self::logDetails(ActivityLogHandler::UPDATED)
                );
            }
        );

        static::deleted(
            function ($model) {
                ActivityLogHandler::addLog(
                    ActivityLogHandler::DELETED,
                    $model->entity_id,
                    $model->module,
                    'Note Deleted',
                    self::logDetails(ActivityLogHandler::DELETED)
                );
            }
        );
    }

    private static function logDetails(string $event)
    {
        return 'Note ' . $event . ' by {created_by_name}';
    }
}
