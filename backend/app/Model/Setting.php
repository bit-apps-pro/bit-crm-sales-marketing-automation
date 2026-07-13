<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;

class Setting extends Model
{
    public const MODULE_NAME = 'setting';

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'setting_key',
        'setting_value',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'setting_value' => 'array'
    ];
}
