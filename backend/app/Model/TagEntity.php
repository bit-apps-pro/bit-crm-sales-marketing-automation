<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;

class TagEntity extends Model
{
    public const MODULE_NAME = 'tag_entity';

    protected $table = 'tag_entity';

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'entity_id',
        'tag_id',
        'module',
    ];
}
