<?php

namespace BitApps\Crm\Model;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Model;

/**
 * One collected (or attempted) payment against an invoice.
 *
 * Provider-agnostic: the CRM ledger truth is `amount`/`currency` (in the
 * invoice's own currency) plus `status`/`paid_at`; whatever collected the
 * money is identified by the (provider, provider_ref) pair — unique per row
 * by service logic (rows are only created together with a freshly created
 * checkout; events look rows up before writing), which is what makes provider
 * event handling idempotent.
 * Provider-flavored settlement details live in the `provider_data` JSON
 * (see DATA_* constants) so integrating FluentCart / SureCart later
 * never changes this schema.
 *
 * Lives in FREE because the records must outlive the pro plugin: a merchant
 * who records payments and later deactivates pro would otherwise lose access
 * to their own financial history. Free writes only PROVIDER_MANUAL rows (an
 * offline settlement an admin records by hand) and shows the history; every
 * provider-collected row, refund and fx-locked value is written by pro's
 * InvoicePaymentService.
 */
class InvoicePayment extends Model
{
    public const DATA_CHARGED_AMOUNT = 'charged_amount';

    public const DATA_CHARGED_CURRENCY = 'charged_currency';

    public const DATA_REFUNDED_AMOUNT = 'refunded_amount';

    public const DATA_FX_RATE = 'fx_rate';

    /** Merchant's own reference for an offline settlement — cheque no., txn id. */
    public const DATA_REFERENCE = 'reference';

    /** Free-text note an admin attached while recording an offline settlement. */
    public const DATA_NOTE = 'note';

    /**
     * Provider key of a settlement collected OUTSIDE any checkout engine —
     * cash, bank transfer, cheque. Not a checkout provider: nothing can be
     * charged through it. It is only ever an identity stamped on a ledger
     * row, so historical rows stay attributable.
     */
    public const PROVIDER_MANUAL = 'manual';

    public const STATUS_PENDING = 'pending';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_FAILED = 'failed';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_REFUNDED = 'refunded';

    public const VALID_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_COMPLETED,
        self::STATUS_FAILED,
        self::STATUS_CANCELLED,
        self::STATUS_REFUNDED,
    ];

    /** Statuses a provider order event may move a payment row to. */
    public const REVOKED_STATUSES = [
        self::STATUS_FAILED,
        self::STATUS_CANCELLED,
        self::STATUS_REFUNDED,
    ];

    protected $table = 'invoice_payments';

    protected $prefix = Config::VAR_PREFIX;

    protected $fillable = [
        'entity_id',
        'module',
        'provider',
        'provider_ref',
        'amount',
        'currency',
        'provider_data',
        'status',
        'paid_at',
        'created_by',
    ];

    protected $casts = [
        'provider_data' => 'array',
        'created_at'    => 'siteTimeZone',
        'updated_at'    => 'siteTimeZone',
        'paid_at'       => 'siteTimeZone',
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
}
