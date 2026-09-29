<?php

namespace BitApps\Crm\HTTP\Requests\Invoice;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

/**
 * Records an offline settlement against an invoice ("Mark as Paid").
 *
 * No amount field: a manual row always settles the full remaining due, and
 * the service computes it from the invoice. Accepting one from the request
 * would let the ledger disagree with the invoice it settles.
 */
class ManualPaymentRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_invoice_update');
    }

    public function rules()
    {
        return [
            'id'        => ['required', 'integer'],
            'paid_at'   => ['nullable', 'string', 'sanitize:text'],
            'reference' => ['nullable', 'string', 'sanitize:text'],
            'note'      => ['nullable', 'string', 'sanitize:text'],
        ];
    }
}
