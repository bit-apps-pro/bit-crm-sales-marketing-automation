<?php

namespace BitApps\Crm\HTTP\Requests\Email;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Services\ModuleService;
use BitApps\Crm\src\Capability;

class SendRequest extends Request
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
            'module'       => ['required', 'string', 'sanitize:text'],
            'entity_id'    => ['required', 'integer'],
            'subject'      => ['required', 'string', 'sanitize:text'],
            'message'      => ['required', 'string', 'sanitize:wp_kses_post'],
            'attachments'  => ['nullable', 'array']
        ];
    }
}
