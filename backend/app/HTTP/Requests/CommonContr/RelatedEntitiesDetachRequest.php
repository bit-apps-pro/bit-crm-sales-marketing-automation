<?php

namespace BitApps\Crm\HTTP\Requests\CommonContr;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Rules\ValidModuleRule;
use BitApps\Crm\src\Capability;

class RelatedEntitiesDetachRequest extends Request
{
    private const MODULES_CAPABILITY_MAP = [
        'contact' => 'bit_crm_contact_update',
        'deal'    => 'bit_crm_deal_update',
    ];

    public function authorize()
    {
        $capability = self::MODULES_CAPABILITY_MAP[$this->relatedEntity] ?? null;

        return Capability::check($capability);
    }

    public function rules()
    {
        return [
            'entity'             => ['required', 'string', new ValidModuleRule()],
            'entityId'           => ['required', 'integer'],
            'relatedEntityIds'   => ['required', 'array'],
            'relatedEntityIds.*' => ['required', 'integer'],
            'relatedEntity'      => ['required', 'string', new ValidModuleRule()],
        ];
    }
}
