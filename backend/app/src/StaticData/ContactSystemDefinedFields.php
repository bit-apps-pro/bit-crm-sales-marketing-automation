<?php

namespace BitApps\Crm\src\StaticData;

use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Services\CurrencyService;
use BitApps\Crm\Services\FieldService;
use BitApps\Crm\Services\UserService;

class ContactSystemDefinedFields
{
    public const BILLING_ADDRESS_GROUP_KEY = 'billing_address';

    public const SHIPPING_ADDRESS_GROUP_KEY = 'shipping_address';

    public const COMPANY_LOOKUP_FIELD_KEY = 'company_id';

    public const OWNER_LOOKUP_FIELD_KEY = 'owner_id';

    public const PARENT_LOOKUP_FIELD_KEY = 'parent_id';

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
            'secondary_email' => [
                'type'               => 'email',
                'field_key'          => 'secondary_email',
                'label'              => 'Secondary Email',
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
            'mobile' => [
                'type'               => 'text',
                'field_key'          => 'mobile',
                'label'              => 'Mobile',
                'required'           => false,
                'name'               => 'tel',
                'is_always_required' => false
            ],
            'fax' => [
                'type'               => 'text',
                'field_key'          => 'fax',
                'label'              => 'Fax',
                'required'           => false,
                'name'               => 'tel',
                'is_always_required' => false
            ],
            'date_of_birth' => [
                'type'               => 'date',
                'field_key'          => 'date_of_birth',
                'label'              => 'Date of Birth',
                'required'           => false,
                'name'               => '',
                'is_always_required' => false
            ],
            self::COMPANY_LOOKUP_FIELD_KEY => [
                'type'               => CommonConstant::LOOKUP_SELECT,
                'related_module'     => Company::MODULE_NAME,
                'source_module'      => Contact::MODULE_NAME,
                'field_key'          => self::COMPANY_LOOKUP_FIELD_KEY,
                'label'              => 'Company',
                'required'           => false,
                'name'               => '',
                'is_always_required' => false
            ],
            self::PARENT_LOOKUP_FIELD_KEY => [
                'type'               => CommonConstant::LOOKUP_SELECT,
                'related_module'     => Contact::MODULE_NAME,
                'source_module'      => Contact::MODULE_NAME,
                'field_key'          => self::PARENT_LOOKUP_FIELD_KEY,
                'label'              => 'Reports To',
                'required'           => false,
                'name'               => '',
                'is_always_required' => false
            ],
            'department' => [
                'type'               => 'text',
                'field_key'          => 'department',
                'label'              => 'Department',
                'required'           => false,
                'name'               => '',
                'is_always_required' => false
            ],
            'assistant' => [
                'type'               => 'text',
                'field_key'          => 'assistant',
                'label'              => 'Assistant',
                'required'           => false,
                'name'               => '',
                'is_always_required' => false
            ],
            'assistant_phone' => [
                'type'               => 'text',
                'field_key'          => 'assistant_phone',
                'label'              => 'Assistant Phone',
                'required'           => false,
                'name'               => 'tel',
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
            self::OWNER_LOOKUP_FIELD_KEY => [
                'type'               => CommonConstant::LOOKUP_SELECT,
                'related_module'     => UserService::MODULE_NAME,
                'field_key'          => self::OWNER_LOOKUP_FIELD_KEY,
                'label'              => 'Owner',
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
            ],
            self::BILLING_ADDRESS_GROUP_KEY => [
                'type'      => 'address',
                'field_key' => self::BILLING_ADDRESS_GROUP_KEY,
                'label'     => 'Billing Address',

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
                'type'      => 'address',
                'field_key' => self::SHIPPING_ADDRESS_GROUP_KEY,
                'label'     => 'Shipping Address',

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

    public static function getAllFieldKeys(): array
    {
        return FieldService::extractFieldKeys(self::all());
    }
}
