<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;

class ActivityLog extends Model
{
    public const MODULE_NAME = 'activity_log';

    public const SEARCHABLE_COLUMNS = ['title', 'event', 'details'];

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'event',
        'title',
        'entity_id',
        'created_by',
        'updated_by',
        'module',
        'details',
    ];

    protected $casts = [
        'created_at' => 'siteTimeZone',
        'updated_at' => 'siteTimeZone',
    ];

    protected function castToSiteTimeZone($value)
    {
        return get_date_from_gmt($value);
    }
}
