<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;
use BitApps\Crm\src\ActivityLogHandler;

class Link extends Model
{
    public const MODULE_NAME = 'link';

    public const SORT_RECENT_FIRST = 'recent_first';

    public const SORT_RECENT_LAST = 'recent_last';

    protected $table = 'links';

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'title',
        'description',
        'link',
        'entity_id',
        'module',
        'created_by',
        'updated_by',
        'attributes',
    ];

    protected $casts = [
        'created_at' => 'siteTimeZone',
        'updated_at' => 'siteTimeZone',
    ];

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
                    $model->entity_id,
                    $model->module,
                    'Link Created',
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
                    'Link Updated',
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
                    'Link Deleted',
                    self::logDetails(ActivityLogHandler::DELETED)
                );
            }
        );
    }

    private static function logDetails(string $event)
    {
        return 'Link ' . $event . ' by {created_by_name}';
    }
}
