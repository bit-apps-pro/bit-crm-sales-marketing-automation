<?php

namespace BitApps\Crm\src\StaticData;

class DealSystemDefinedStages
{
    private const STAGES = [
        'initial_contact' => [
            'key'            => 'initial_contact',
            'name'           => 'Initial Contact',
            'color'          => '#595959',
            'deal_category'  => 'open',
            'probability'    => 10,
            'system_defined' => true,
        ],
        'qualification' => [
            'key'            => 'qualification',
            'name'           => 'Qualification',
            'color'          => '#1890ff',
            'deal_category'  => 'open',
            'probability'    => 25,
            'system_defined' => true,
        ],
        'proposal' => [
            'key'            => 'proposal',
            'name'           => 'Proposal',
            'color'          => '#13c2c2',
            'deal_category'  => 'open',
            'probability'    => 50,
            'system_defined' => true,
        ],
        'negotiation' => [
            'key'            => 'negotiation',
            'name'           => 'Negotiation',
            'color'          => '#fa8c16',
            'deal_category'  => 'open',
            'probability'    => 75,
            'system_defined' => true,
        ],
        'won' => [
            'key'            => 'won',
            'name'           => 'Won',
            'color'          => '#52c41a',
            'deal_category'  => 'closed_won',
            'probability'    => 100,
            'system_defined' => true,
        ],
        'lost' => [
            'key'            => 'lost',
            'name'           => 'Lost',
            'color'          => '#ff4d4f',
            'deal_category'  => 'closed_lost',
            'probability'    => 0,
            'system_defined' => true,
        ],
    ];

    public static function all(): array
    {
        return self::STAGES;
    }

    public static function getByKeys(array $keys): array
    {
        return array_filter(self::STAGES, fn ($stage) => \in_array($stage['key'], $keys, true));
    }
}
