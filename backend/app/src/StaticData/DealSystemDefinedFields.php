<?php

namespace BitApps\Crm\src\StaticData;

use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Services\CurrencyService;
use BitApps\Crm\Services\DealStageService;
use BitApps\Crm\Services\UserService;

class DealSystemDefinedFields
{
    public const COMPANY_LOOKUP_FIELD_KEY = 'company_id';

    public const CONTACT_LOOKUP_FIELD_KEY = 'contact_id';

    public const OWNER_LOOKUP_FIELD_KEY = 'owner_id';

    public static function all()
    {
        return [
            'name' => [
                'type'               => 'text',
                'field_key'          => 'name',
                'label'              => 'Name',
                'required'           => true,
                'name'               => 'given-name',
                'is_always_required' => true
            ],
            self::CONTACT_LOOKUP_FIELD_KEY => [
                'type'               => CommonConstant::LOOKUP_SELECT,
                'related_module'     => Contact::MODULE_NAME,
                'source_module'      => Deal::MODULE_NAME,
                'field_key'          => self::CONTACT_LOOKUP_FIELD_KEY,
                'label'              => 'Contact',
                'required'           => true,
                'name'               => '',
                'is_always_required' => true
            ],
            self::COMPANY_LOOKUP_FIELD_KEY => [
                'type'               => CommonConstant::LOOKUP_SELECT,
                'related_module'     => Company::MODULE_NAME,
                'source_module'      => Deal::MODULE_NAME,
                'field_key'          => self::COMPANY_LOOKUP_FIELD_KEY,
                'label'              => 'Company',
                'required'           => false,
                'name'               => '',
                'is_always_required' => false
            ],
            'email' => [
                'type'               => 'email',
                'field_key'          => 'email',
                'label'              => 'Email',
                'required'           => false,
                'name'               => 'email',
                'is_always_required' => false
            ],
            'type' => [
                'type'      => 'select',
                'field_key' => 'type',
                'label'     => 'Type',
                'required'  => false,
                'name'      => '',
                'options'   => [
                    ['label' => 'New Business', 'value' => 'new-business'],
                    ['label' => 'Existing Business', 'value' => 'existing-business'],
                ],
                'is_always_required' => false
            ],
            'lead_source' => [
                'type'      => 'select',
                'field_key' => 'lead_source',
                'label'     => 'Lead Source',
                'required'  => false,
                'name'      => 'lead-source',
                'options'   => [
                    ['label' => 'None', 'value' => 'none'],
                    ['label' => 'Advertisement', 'value' => 'advertisement'],
                    ['label' => 'Cold Call', 'value' => 'cold-call'],
                    ['label' => 'Employee Referral', 'value' => 'employee-referral'],
                    ['label' => 'External Referral', 'value' => 'external-referral'],
                    ['label' => 'Online Store', 'value' => 'online-store'],
                    ['label' => 'Facebook', 'value' => 'facebook'],
                ],
                'is_always_required' => false
            ],
            self::OWNER_LOOKUP_FIELD_KEY => [
                'type'               => CommonConstant::LOOKUP_SELECT,
                'related_module'     => UserService::MODULE_NAME,
                'field_key'          => self::OWNER_LOOKUP_FIELD_KEY,
                'label'              => 'Owner',
                'required'           => false,
                'name'               => '',
                'is_always_required' => false
            ],
            'stage' => [
                'type'               => 'select',
                'field_key'          => 'stage',
                'label'              => 'Stage',
                'required'           => true,
                'name'               => '',
                'options'            => (new DealStageService())->getStagesAsOptions(DealStageService::STATUS_ACTIVE),
                'default_value'      => (new DealStageService())->getInitialStageKey(),
                'is_always_required' => true,
                'is_editable'        => false,
            ],
            'probability' => [
                'type'               => 'number',
                'field_key'          => 'probability',
                'label'              => 'Probability',
                'required'           => false,
                'name'               => '',
                'is_always_required' => false
            ],
            'currency' => [
                'type'               => 'select',
                'field_key'          => 'currency',
                'label'              => 'Currency',
                'required'           => true,
                'name'               => 'currency',
                'options'            => (new CurrencyService())->getOtherCurrenciesAsOptions(),
                'is_always_required' => true,
                'default_value'      => CurrencyHelper::getHomeCurrency(),
                'is_editable'        => false,
                'status'             => false
            ],
            'amount' => [
                'type'               => 'currency',
                'field_key'          => 'amount',
                'label'              => 'Amount',
                'required'           => false,
                'name'               => '',
                'is_always_required' => false
            ],
            'description' => [
                'type'               => 'textarea',
                'field_key'          => 'description',
                'label'              => 'Description',
                'required'           => false,
                'name'               => '',
                'is_always_required' => false
            ],

        ];
    }

    public static function getFieldKeysByType(string $type): array
    {
        $fields = self::all();

        $keys = [];
        foreach ($fields as $key => $field) {
            if ($field['type'] !== $type) {
                continue;
            }
            $keys[$key] = true;
        }

        return $keys;
    }
}
