<?php

namespace BitApps\Crm\HTTP\Requests\Imap;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Services\ModuleService;
use BitApps\Crm\src\Capability;

class FetchEmailRequest extends Request
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
            'email'    => ['required', 'string', 'email'],
            'imap_id'  => ['required', 'integer'],
            'module'   => ['required', 'string', 'sanitize:text'],
            'autoSync' => ['nullable', 'boolean']
        ];
    }
}
