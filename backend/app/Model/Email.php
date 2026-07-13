<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;

class Email extends Model
{
    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'email_uid',
        'message_id',
        'entity_email',
        'email_date',
        'subject',
        'body',
        'email_direction',
        'imap_id',
        'sent_from',
        'attachments',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'attachments' => 'array',
    ];
}
