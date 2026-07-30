<?php

namespace BitApps\Crm\src\StaticData;

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\Arr;

class OtherPluginsData
{
    private static $plugins = [
        'bit-smtp' => [
            'slug' => 'bit-smtp',
            'path' => 'bit-smtp/bit_smtp.php',
        ],
        'bit-form' => [
            'slug' => 'bit-form',
            'path' => 'bit-form/bitforms.php',
        ],
        'bit-integrations' => [
            'slug' => 'bit-integrations',
            'path' => 'bit-integrations/bitwpfi.php',
        ],
        'bit-pi' => [
            'slug' => 'bit-pi',
            'path' => 'bit-pi/bit-pi.php',
        ],
    ];

    /**
     * Get plugin data by slug.
     *
     * @param string $pluginSlug Plugin slug
     *
     * @return array Plugin data
     */
    public static function getPluginData(string $pluginSlug): array
    {
        return self::$plugins[$pluginSlug] ?? [];
    }

    /**
     * Verify plugin data.
     *
     * @param array $pluginData Plugin data
     *
     * @return bool True if plugin data is valid, false otherwise
     */
    public static function verifyPluginData(array $pluginData): bool
    {
        return Arr::has($pluginData, ['slug', 'path']);
    }
}
