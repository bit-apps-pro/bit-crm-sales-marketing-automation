<?php

namespace BitApps\Crm\HTTP\Requests\Email;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Services\ModuleService;
use BitApps\Crm\src\Capability;

class IndexRequest extends Request
{
    public function authorize()
    {
        $capability = ModuleService::moduleViewCapability($this->module);

        if (!$capability) {
            return false;
        }

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
