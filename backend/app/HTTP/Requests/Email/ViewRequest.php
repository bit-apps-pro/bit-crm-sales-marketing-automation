<?php

namespace BitApps\Crm\HTTP\Requests\Email;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Services\ModuleService;
use BitApps\Crm\src\Capability;

class ViewRequest extends Request
{
    public function authorize()
    {
        $capability = ModuleService::moduleViewCapability($this->module);

        if (!$capability) {
            return false;
        }

        return Capability::check($capability);
    }

    public function rules(): array
    {
        return [
            'id'     => ['required', 'integer'],
            'module' => ['required', 'string', 'sanitize:text'],
        ];
    }
}
