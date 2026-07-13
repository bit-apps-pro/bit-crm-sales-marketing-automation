<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;

class Attachment extends Model
{
    public const MODULE_NAME = 'attachment';

    protected $table = 'attachments';

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'file_name',
        'media_id',
        'media_url',
        'mime',
        'file_size_in_bytes',
        'entity_id',
        'module',
        'created_by',
        'updated_by',
        'attributes',
    ];

    protected $casts = [
        'attributes' => 'array',
        'created_at' => 'siteTimeZone',
        'updated_at' => 'siteTimeZone',
    ];

    protected function castToSiteTimeZone($value)
    {
        return get_date_from_gmt($value);
    }
}
