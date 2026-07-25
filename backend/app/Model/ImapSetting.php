<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;
use BitApps\Crm\src\ActivityLogHandler;

class ImapSetting extends Model
{
    public const MODULE_NAME = 'imap_settings';

    public const VISIBILITY_PUBLIC = 'public';

    public const VISIBILITY_PRIVATE = 'private';

    public const FETCH_STATUS_OPTION_NAME = 'imap_fetch_status';

    public const FETCH_PAGINATION_DATA_OPTION_NAME = 'imap_fetch_pagination_data';

    public const STATUS_FETCH_PROCESSING = 'processing';

    public const STATUS_FETCH_COMPLETED = 'completed';

    public const STATUS_FETCH_IDLE = 'idle';

    public const STATUS_FETCH_ERROR = 'error';

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'title',
        'created_by',
        'updated_by',
        'platform',
        'username',
        'app_password',
        'host',
        'port',
        'encryption',
        'visibility',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

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
