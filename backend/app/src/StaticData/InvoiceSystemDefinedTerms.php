<?php

namespace BitApps\Crm\src\StaticData;

class InvoiceSystemDefinedTerms
{
    private const TERMS = [
        'custom' => [
            'key'  => 'custom',
            'name' => 'Custom',
            'days' => 0,
        ],
        'net_15' => [
            'key'  => 'net_15',
            'name' => 'Net 15',
            'days' => 15,
        ],
        'net_30' => [
            'key'  => 'net_30',
            'name' => 'Net 30',
            'days' => 30,
        ],
        'net_45' => [
            'key'  => 'net_45',
            'name' => 'Net 45',
            'days' => 45,
        ],
        'net_60' => [
            'name' => 'Net 60',
            'days' => 60,
            'key'  => 'net_60',
        ],
    ];

    public static function all(): array
    {
        return self::TERMS;
    }
}
