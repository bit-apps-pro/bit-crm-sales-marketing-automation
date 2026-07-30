<?php

namespace BitApps\Crm\HTTP\Requests\Activity;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Rules\Activity\PriorityRule;
use BitApps\Crm\Rules\ValidModuleRule;
use BitApps\Crm\src\Capability;

class IndexRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_activity_view');
    }

    public function rules()
    {
        $rules = [
            'page'        => ['required', 'integer'],
            'module'      => ['nullable', 'string', new ValidModuleRule()],
            'entityId'    => ['nullable', 'integer'],
            'perPage'     => ['nullable', 'integer'],
            'status'      => ['nullable', 'string'],
            'type'        => ['nullable', 'string'],
            'search'      => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'integer'],
        ];

        if ($this->type === Activity::TYPES['TASK']) {
            $rules['priority'] = ['nullable', 'string', 'sanitize:text', new PriorityRule()];
        }

        return $rules;
    }
}
