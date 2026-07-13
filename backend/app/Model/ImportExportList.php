<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;

class ImportExportList extends Model
{
    public const MODULE_NAME = 'import_export_list';

    public const EXPORT = 'export';

    public const IMPORT = 'import';

    public const IMPORT_DIR = '/bit_crm/imports/';

    public const EXPORT_DIR = '/bit_crm/exports/';

    public const COUNT = [
        'TOTAL'     => 'total',
        'COMPLETED' => 'completed',
        'UPDATED'   => 'updated',
        'SKIPPED'   => 'skipped',
    ];

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'type',
        'process_id',
        'module',
        'total',
        'completed',
        'updated',
        'skipped',
        'file_name',
        'file_path',
        'status',
        'created_by',
        'updated_by',
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
