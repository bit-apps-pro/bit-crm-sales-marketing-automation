<?php

namespace BitApps\Crm\src\StaticData;

use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Services\CurrencyService;
use BitApps\Crm\Services\FieldService;
use BitApps\Crm\Services\UserService;

class LeadSystemDefinedFields
{
    public const BILLING_ADDRESS_GROUP_KEY = 'billing_address';

    public const SHIPPING_ADDRESS_GROUP_KEY = 'shipping_address';

    public const OWNER_LOOKUP_FIELD_KEY = 'owner_id';

    public const COMPANY_NAME_FIELD_KEY = 'company_name';

    public static function all()
    {
        return [
            'personal_information' => [
                'type'      => 'section',
                'field_key' => 'personal_information',
                'label'     => 'Personal Information',
                'required'  => false
            ],
            'title' => [
                'type'      => 'select',
                'field_key' => 'title',
                'label'     => 'Title',
                'required'  => false,
                'name'      => 'honorific-prefix',
                'options'   => [
                    ['label' => 'Mrs.', 'value' => 'mrs'],
                    ['label' => 'Mr.', 'value' => 'mr'],
                    ['label' => 'Miss', 'value' => 'miss'],
                    ['label' => 'Ms.', 'value' => 'ms'],
                    ['label' => 'Dr.', 'value' => 'dr'],
                ],
                'is_always_required' => false
            ],
            'first_name' => [
                'type'               => 'text',
                'field_key'          => 'first_name',
                'label'              => 'First Name',
                'required'           => false,
                'name'               => 'given-name',
                'is_always_required' => false
            ],
            'last_name' => [
                'type'               => 'text',
                'field_key'          => 'last_name',
                'label'              => 'Last Name',
                'required'           => true,
                'name'               => 'family-name',
                'is_always_required' => true
            ],
            'email' => [
                'type'               => 'email',
                'field_key'          => 'email',
                'label'              => 'Email',
                'required'           => false,
                'name'               => '',
                'is_always_required' => false
            ],
            'phone' => [
                'type'               => 'text',
                'field_key'          => 'phone',
                'label'              => 'Phone',
                'required'           => false,
                'name'               => 'tel',
                'is_always_required' => false
            ],
            self::COMPANY_NAME_FIELD_KEY => [
                'type'               => 'text',
                'field_key'          => self::COMPANY_NAME_FIELD_KEY,
                'label'              => 'Company Name',
                'required'           => false,
                'name'               => 'company-name',
                'is_always_required' => false
            ],
            'website' => [
                'type'               => 'url',
                'field_key'          => 'website',
                'label'              => 'Website',
                'required'           => false,
                'name'               => 'url',
                'is_always_required' => false
            ],
            'industry' => [
                'type'               => 'text',
                'field_key'          => 'industry',
                'label'              => 'Industry',
                'required'           => false,
                'name'               => '',
                'is_always_required' => false
            ],
            'annual_revenue' => [
                'type'               => 'number',
                'field_key'          => 'annual_revenue',
                'label'              => 'Annual Revenue',
                'required'           => false,
                'name'               => '',
                'is_always_required' => false
            ],
            'lead_source' => [
                'type'          => 'select',
                'field_key'     => 'lead_source',
                'label'         => 'Lead Source',
                'required'      => false,
                'name'          => '',
                'default_value' => 'none',
                'options'       => [
                    ['label' => 'None', 'value' => 'none'],
                    ['label' => 'Advertisement', 'value' => 'advertisement'],
                    ['label' => 'Cold Call', 'value' => 'cold_call'],
                    ['label' => 'Employee Referral', 'value' => 'employee_referral'],
                    ['label' => 'External Referral', 'value' => 'external_referral'],
                    ['label' => 'Online Store', 'value' => 'online_store'],
                    ['label' => 'Facebook', 'value' => 'facebook'],
                ],
                'is_always_required' => false
            ],
            'lead_status' => [
                'type'          => 'select',
                'field_key'     => 'lead_status',
                'label'         => 'Lead Status',
                'required'      => false,
                'name'          => '',
                'default_value' => 'qualifies',
                'options'       => [
                    ['label' => 'Qualifies', 'value' => 'qualifies'],
                    ['label' => 'Negotiation Done', 'value' => 'negotiation_done'],
                    ['label' => 'Discount Approved', 'value' => 'discount_approved'],
                    ['label' => 'Discount Rejected', 'value' => 'discount_rejected'],
                    ['label' => 'Contract Sent', 'value' => 'contract_sent'],
                    ['label' => 'Deal Win', 'value' => 'deal_win'],
                    ['label' => 'Deal Lost', 'value' => 'deal_lost'],
                ],
                'is_always_required' => false
            ],
            self::OWNER_LOOKUP_FIELD_KEY => [
                'type'               => CommonConstant::LOOKUP_SELECT,
                'related_module'     => UserService::MODULE_NAME,
                'source_module'      => Lead::MODULE_NAME,
                'field_key'          => self::OWNER_LOOKUP_FIELD_KEY,
                'label'              => 'Owner',
                'required'           => false,
                'name'               => '',
                'is_always_required' => false,
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
            ],
            self::BILLING_ADDRESS_GROUP_KEY => [
                'type'                               => 'address',
                'field_key'                          => self::BILLING_ADDRESS_GROUP_KEY,
                'label'                              => 'Billing Address',
                FieldService::GROUP_FIELDS_ARRAY_KEY => [
                    'billing_address_line_1' => [
                        'type'               => 'text',
                        'field_key'          => 'billing_address_line_1',
                        'label'              => 'Billing Address Line 1',
                        'required'           => false,
                        'name'               => '',
                        'is_always_required' => false
                    ],
                    'billing_address_line_2' => [
                        'type'               => 'text',
                        'field_key'          => 'billing_address_line_2',
                        'label'              => 'Billing Address Line 2',
                        'required'           => false,
                        'name'               => '',
                        'is_always_required' => false
                    ],
                    'billing_city' => [
                        'type'               => 'text',
                        'field_key'          => 'billing_city',
                        'label'              => 'Billing City',
                        'required'           => false,
                        'name'               => '',
                        'is_always_required' => false
                    ],
                    'billing_county' => [
                        'type'               => 'text',
                        'field_key'          => 'billing_county',
                        'label'              => 'Billing County',
                        'required'           => false,
                        'name'               => '',
                        'is_always_required' => false
                    ],
                    'billing_state' => [
                        'type'               => 'text',
                        'field_key'          => 'billing_state',
                        'label'              => 'Billing State',
                        'required'           => false,
                        'name'               => '',
                        'is_always_required' => false
                    ],
                    'billing_zip' => [
                        'type'               => 'text',
                        'field_key'          => 'billing_zip',
                        'label'              => 'Billing Zip',
                        'required'           => false,
                        'name'               => '',
                        'is_always_required' => false
                    ],
                    'billing_country' => [
                        'type'               => 'text',
                        'field_key'          => 'billing_country',
                        'label'              => 'Billing Country',
                        'required'           => false,
                        'name'               => '',
                        'is_always_required' => false
                    ],
                ]
            ],
            self::SHIPPING_ADDRESS_GROUP_KEY => [
                'type'                               => 'address',
                'field_key'                          => self::SHIPPING_ADDRESS_GROUP_KEY,
                'label'                              => 'Shipping Address',
                FieldService::GROUP_FIELDS_ARRAY_KEY => [
                    'shipping_address_line_1' => [
                        'type'               => 'text',
                        'field_key'          => 'shipping_address_line_1',
                        'label'              => 'Shipping Address Line 1',
                        'required'           => false,
                        'name'               => '',
                        'is_always_required' => false
                    ],
                    'shipping_address_line_2' => [
                        'type'               => 'text',
                        'field_key'          => 'shipping_address_line_2',
                        'label'              => 'Shipping Address Line 2',
                        'required'           => false,
                        'name'               => '',
                        'is_always_required' => false
                    ],
                    'shipping_city' => [
                        'type'               => 'text',
                        'field_key'          => 'shipping_city',
                        'label'              => 'Shipping City',
                        'required'           => false,
                        'name'               => '',
                        'is_always_required' => false
                    ],
                    'shipping_county' => [
                        'type'               => 'text',
                        'field_key'          => 'shipping_county',
                        'label'              => 'Shipping County',
                        'required'           => false,
                        'name'               => '',
                        'is_always_required' => false
                    ],
                    'shipping_state' => [
                        'type'               => 'text',
                        'field_key'          => 'shipping_state',
                        'label'              => 'Shipping State',
                        'required'           => false,
                        'name'               => '',
                        'is_always_required' => false
                    ],
                    'shipping_zip' => [
                        'type'               => 'text',
                        'field_key'          => 'shipping_zip',
                        'label'              => 'Shipping Zip',
                        'required'           => false,
                        'name'               => '',
                        'is_always_required' => false
                    ],
                    'shipping_country' => [
                        'type'               => 'text',
                        'field_key'          => 'shipping_country',
                        'label'              => 'Shipping Country',
                        'required'           => false,
                        'name'               => '',
                        'is_always_required' => false
                    ],
                ]
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

    public static function getGroupKeys()
    {
        return [
            self::BILLING_ADDRESS_GROUP_KEY,
            self::SHIPPING_ADDRESS_GROUP_KEY,
        ];
    }
}
