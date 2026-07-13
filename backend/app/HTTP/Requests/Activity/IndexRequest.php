<?php

namespace BitApps\Crm\HTTP\Requests\Activity;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Rules\Activity\PriorityRule;
use BitApps\Crm\Rules\ValidModuleRule;

class IndexRequest extends Request
{
    // TODO: Uncomment the authorize method when capabilities are implemented
    // public function authorize()
    // {
    //     return Capability::check('cap');
    // }

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
