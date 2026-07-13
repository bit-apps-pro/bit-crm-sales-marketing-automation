<?php

namespace BitApps\Crm\HTTP\Requests\Activity;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Rules\Activity\PriorityRule;
use BitApps\Crm\Rules\Activity\TypeRule;
use BitApps\Crm\Rules\ValidModuleRule;

class UpdateRequest extends Request
{
    // TODO: Uncomment the authorize method when capabilities are implemented
    // public function authorize()
    // {
    //     return Capability::check('cap');
    // }

    public function rules()
    {
        $rules = [
            'id'          => ['required', 'integer'],
            'module'      => ['nullable', 'string', new ValidModuleRule()],
            'entity_id'   => ['nullable', 'integer'],
            'title'       => ['required', 'string', 'sanitize:text', 'max:255'],
            'type'        => ['required', 'string', 'sanitize:text', new TypeRule()],
            'due_date'    => ['nullable', 'string', 'sanitize:text'],
            'details'     => ['nullable', 'string', 'sanitize:text'],
            'attachments' => ['nullable', 'array'],
            'assigned_to' => ['required', 'integer'],
            'attributes'  => ['nullable', 'array'],
        ];

        if ($this->type === Activity::TYPES['TASK']) {
            $rules['priority'] = ['required', 'string', 'sanitize:text', new PriorityRule()];
        }

        return $rules;
    }
}
