<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;
use BitApps\Crm\src\ActivityLogHandler;

class Invoice extends Model
{
    public const MODULE_NAME = 'invoice';

    public const STATUS_DRAFT = 'draft';

    public const STATUS_OVERDUE = 'overdue';

    public const STATUS_PAID = 'paid';

    public const STATUS_SENT = 'sent';

    public const VALID_STATUSES = [self::STATUS_DRAFT, self::STATUS_OVERDUE, self::STATUS_PAID, self::STATUS_SENT];

    public const ALLOWED_STATUS_TRANSITIONS = [
        self::STATUS_DRAFT   => [self::STATUS_SENT, self::STATUS_PAID, self::STATUS_OVERDUE],
        self::STATUS_SENT    => [self::STATUS_PAID, self::STATUS_OVERDUE],
        self::STATUS_OVERDUE => [self::STATUS_PAID, self::STATUS_SENT],
        self::STATUS_PAID    => [],
    ];

    public const RELATED_MODELS = [
        LineItem::class,
        Trash::class,
    ];

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'invoice_date',
        'due_date',
        'gross_discount_amount',
        'gross_discount_type',
        'entity_id',
        'module',
        'invoice_prefix',
        'top_section_notes',
        'status',
        'tax_option',
        'sent_at',
        'is_trash',
        'term_key',
        'paid_at',
        'sent_at',
        'bottom_section_notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'top_section_notes'    => 'array',
        'bottom_section_notes' => 'array',
        'is_trash'             => 'bool',
        'created_at'           => 'siteTimeZone',
        'updated_at'           => 'siteTimeZone',
        'invoice_date'         => 'siteTimeZone',
        'due_date'             => 'siteTimeZone',
        'paid_at'              => 'siteTimeZone',
        'sent_at'              => 'siteTimeZone',
    ];

    public static function canTransitionStatus(string $from, string $to): bool
    {
        if ($from === $to) {
            return true;
        }

        return \in_array($to, self::ALLOWED_STATUS_TRANSITIONS[$from] ?? [], true);
    }

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
                    $model->id,
                    self::MODULE_NAME,
                );
            }
        );

        static::updated(
            function ($model) {
                ActivityLogHandler::addLog(
                    ActivityLogHandler::UPDATED,
                    $model->id,
                    self::MODULE_NAME,
                );
            }
        );

        static::deleted(
            function ($model) {
                ActivityLogHandler::addLog(
                    ActivityLogHandler::DELETED,
                    $model->id,
                    self::MODULE_NAME,
                );
            }
        );
    }
}
