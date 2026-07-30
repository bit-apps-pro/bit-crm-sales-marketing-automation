<?php

namespace BitApps\Crm\HTTP\Requests\Activity;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Rules\Activity\PriorityRule;
use BitApps\Crm\Rules\Activity\TypeRule;
use BitApps\Crm\Rules\ValidModuleRule;
use BitApps\Crm\src\Capability;

class UpdateRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_activity_update');
    }

    public function rules()
    {
        $rules = [
            'id'          => ['required', 'integer'],
            'module'      => ['nullable', 'string', new ValidModuleRule()],
            'title'       => ['required', 'string', 'sanitize:text', 'max:255'],
            'type'        => ['required', 'string', 'sanitize:text', new TypeRule()],
            'due_date'    => ['nullable', 'string', 'sanitize:text'],
            'is_shared'   => ['nullable', 'boolean'],
            'entity_id'   => ['nullable', 'integer'],
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
