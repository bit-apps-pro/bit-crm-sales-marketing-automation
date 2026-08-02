<?php

namespace BitApps\Crm\HTTP\Requests\Activity;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Rules\Activity\PriorityRule;
use BitApps\Crm\Rules\Activity\TypeRule;
use BitApps\Crm\src\Capability;

class StoreRequest extends Request
{
    public function authorize()
    {
        return Capability::check('bit_crm_activity_create');
    }

    public function rules()
    {
        $rules = [
            'title'       => ['required', 'string', 'sanitize:text', 'max:255'],
            'type'        => ['required', 'string', 'sanitize:text', new TypeRule()],
            'due_date'    => ['nullable', 'string', 'sanitize:text'],
            'details'     => ['nullable', 'string', 'sanitize:text'],
            'attachments' => ['nullable', 'array'],
            'is_shared'   => ['nullable', 'boolean'],
            'entity_id'   => ['required', 'integer'],
            'module'      => ['required', 'string', 'sanitize:text'],
            'assigned_to' => ['required', 'integer'],
            'attributes'  => ['nullable', 'array'],
        ];

        if ($this->type === Activity::TYPES['TASK']) {
            $rules = array_merge($rules, self::otherRules());
        }

        return $rules;
    }

    public static function otherRules(): array
    {
        return [
            'priority' => ['required', 'string', 'sanitize:text', new PriorityRule()],
        ];
    }
}
