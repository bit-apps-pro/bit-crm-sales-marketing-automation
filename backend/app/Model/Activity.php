<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;
use BitApps\Crm\src\ActivityLogHandler;

class Activity extends Model
{
    public const MODULE_NAME = 'activity';

    public const TYPES = [
        'TASK'    => 'task',
        'MEETING' => 'meeting',
        'CALL'    => 'call',
        'NOTE'    => 'note',
    ];

    public const PRIORITIES = [
        'LOW'    => 'low',
        'MEDIUM' => 'medium',
        'HIGH'   => 'high',
    ];

    protected $table = 'activities';

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'title',
        'type',
        'priority',
        'due_date',
        'details',
        'attachments',
        'is_completed',
        'entity_id',
        'module',
        'assigned_to',
        'is_shared',
        'user_id',
        'created_by',
        'updated_by',
        'attributes',
    ];

    protected $casts = [
        'is_shared'    => 'bool',
        'is_completed' => 'bool',
        'attachments'  => 'array',
        'due_date'     => 'siteTimeZone',
        'created_at'   => 'siteTimeZone',
        'updated_at'   => 'siteTimeZone',
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
                    self::logTitle(ActivityLogHandler::CREATED, $model->type),
                    self::logDetails(ActivityLogHandler::CREATED, $model->type)
                );
            }
        );

        static::updated(
            function ($model) {
                ActivityLogHandler::addLog(
                    ActivityLogHandler::UPDATED,
                    $model->entity_id,
                    $model->module,
                    self::logTitle(ActivityLogHandler::UPDATED, $model->type),
                    self::logDetails(ActivityLogHandler::UPDATED, $model->type)
                );
            }
        );

        static::deleted(
            function ($model) {
                ActivityLogHandler::addLog(
                    ActivityLogHandler::DELETED,
                    $model->entity_id,
                    $model->module,
                    self::logTitle(ActivityLogHandler::DELETED, $model->type),
                    self::logDetails(ActivityLogHandler::DELETED, $model->type)
                );
            }
        );
    }

    private static function logTitle(string $event, string $type)
    {
        return ucfirst($type) . ' ' . $event;
    }

    private static function logDetails(string $event, string $type)
    {
        return ucfirst($type) . ' ' . $event . ' by {created_by_name}';
    }
}
