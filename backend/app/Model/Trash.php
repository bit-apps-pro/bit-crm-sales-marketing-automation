<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;

class Trash extends Model
{
    public const MODULE_NAME = 'trash';

    public const IS_QUEUE_IN_PROCESS_KEY = 'is_empty_trash_queue_in_process';

    protected $table = 'trashes';

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'entity_id',
        'module',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_converted' => 'boolean',
        'is_trash'     => 'boolean',
        'created_at'   => 'siteTimeZone',
        'updated_at'   => 'siteTimeZone',
    ];

    protected function castToSiteTimeZone($value)
    {
        return get_date_from_gmt($value);
    }
}
