<?php

namespace BitApps\Crm\HTTP\Requests\GlobalSearch;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\src\Capability;

class SearchRequest extends Request
{
    /**
     * Anyone who can open the CRM may search; each result group is gated by its own
     * view capability.
     */
    public function authorize()
    {
        return Capability::check('bit_crm_menu');
    }

    public function rules()
    {
        return [
            'term'  => ['required', 'string', 'sanitize:text', 'max:100'],
            'scope' => ['nullable', 'string', 'sanitize:text', 'max:20'],
        ];
    }
}
