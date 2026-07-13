<?php

namespace BitApps\Crm\HTTP\Requests\Email;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class IndexRequest extends Request
{
    private const MODULES_CAPABILITY_MAP = [
        'lead'    => 'bit_crm_lead_view',
        'contact' => 'bit_crm_contact_view',
        'company' => 'bit_crm_company_view',
        'deal'    => 'bit_crm_deal_view',
    ];

    public function authorize()
    {
        $capability = self::MODULES_CAPABILITY_MAP[$this->module] ?? null;

        return Capability::check($capability);
    }

    public function rules()
    {
        return [
            'entity_email' => ['required', 'string', 'sanitize:text'],
            'imap_id'      => ['required', 'integer'],
            'page'         => ['nullable', 'integer'],
            'perPage'      => ['nullable', 'integer'],
            'sortBy'       => ['nullable', 'string', 'sanitize:text'],
            'sortOrder'    => ['nullable', 'string', 'sanitize:text'],
            'searchTerm'   => ['nullable', 'string', 'sanitize:text'],
            'module'       => ['required', 'string', 'sanitize:text'],
            'source'       => ['nullable', 'string', 'sanitize:text'],
        ];
    }
}
