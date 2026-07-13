<?php

namespace BitApps\Crm\HTTP\Requests\Activity;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Rules\Activity\PriorityRule;
use BitApps\Crm\Rules\Activity\TypeRule;

class StoreRequest extends Request
{
    // TODO: Uncomment the authorize method when capabilities are implemented
    // public function authorize()
    // {
    //     return Capability::check('cap');
    // }

    public function rules()
    {
        $rules = [
            'title'       => ['required', 'string', 'sanitize:text', 'max:255'],
            'type'        => ['required', 'string', 'sanitize:text', new TypeRule()],
            'due_date'    => ['nullable', 'string', 'sanitize:text'],
            'details'     => ['nullable', 'string', 'sanitize:text'],
            'attachments' => ['nullable', 'array'],
            'entity_id'   => ['required', 'integer'],
            'module'      => ['required', 'string', 'sanitize:text'],
            'assigned_to' => ['required', 'integer'],
            'attributes'  => ['nullable', 'array'],
        ];

        if ($this->type === Activity::TYPES['TASK']) {
            $rules['priority'] = ['required', 'string', 'sanitize:text', new PriorityRule()];
        }

        return $rules;
    }
}
