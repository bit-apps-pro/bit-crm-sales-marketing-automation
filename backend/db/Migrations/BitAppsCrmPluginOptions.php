<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection as DB;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;

if (!defined('ABSPATH')) {
    exit;
}

final class BitAppsCrmPluginOptions extends Migration
{
    public function up(): void
    {
        Config::updateOption('db_version', Config::DB_VERSION, true);
        Config::updateOption('installed', time(), true);
        Config::updateOption('version', Config::VERSION, true);
    }

    public function down()
    {
        $patterns = [
            DB::esc_like(Config::VAR_PREFIX) . '%',
            DB::esc_like('wp_' . Config::VAR_PREFIX) . '%',
        ];

        $optionNames = DB::get_col(
            DB::prepare(
                'SELECT option_name FROM `' . DB::wpPrefix() . 'options` WHERE option_name LIKE %s OR option_name LIKE %s',
                $patterns
            )
        );

        if (!$optionNames) {
            return;
        }

        DB::query(
            DB::prepare(
                'DELETE FROM `' . DB::wpPrefix() . 'options` WHERE option_name LIKE %s OR option_name LIKE %s',
                $patterns
            )
        );

        if (function_exists('wp_cache_delete_multiple')) {
            wp_cache_delete_multiple($optionNames, 'options');
            wp_cache_delete('alloptions', 'options');
            wp_cache_delete('notoptions', 'options');
        }
    }
}
