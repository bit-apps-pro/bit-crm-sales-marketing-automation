<?php

use BitApps\Crm\Config;

$_tests_dir = __DIR__ . '/__libs';

if (!file_exists("{$_tests_dir}/includes/functions.php")) {
    echo "Could not find {$_tests_dir}/includes/functions.php, have you run bin/install-wp-tests.sh ?" . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    exit(1);
}

if (!file_exists(dirname(__DIR__) . '/tests.config.php')) {
    echo "Could not find \dirname(__DIR__) . '/tests.config.php, create an tests config file from tests.config.sample.php" . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    exit(1);
}

// Give access to tests_add_filter() function.
require_once "{$_tests_dir}/includes/functions.php";
define('WP_TESTS_CONFIG_FILE_PATH', dirname(__DIR__) . '/tests.config.php');
/**
 * Manually load the plugin being tested.
 */
function _manually_load_plugin()
{
    if (!function_exists('activate_plugin')) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }

    if (!is_plugin_active(basename(dirname(__DIR__)) . DIRECTORY_SEPARATOR . Config::SLUG . '.php')) {
        activate_plugin(basename(dirname(__DIR__)) . DIRECTORY_SEPARATOR . Config::SLUG . '.php');
    }

    $group = -1;
    foreach ($_SERVER['argv'] as $key => $value) {
        if ($value === '--group') {
            $group = $key + 1;
        }

        if ($key === $group && $value === 'ajax') {
            define('TEST_AJAX', $value);
            $group = -1;
        }

        if ($key === $group && $value === 'api') {
            define('TEST_API', $value);
            define('REST_REQUEST', true);
            $group = -1;
        }
    }
    require dirname(__DIR__) . DIRECTORY_SEPARATOR . Config::SLUG . '.php';
}

tests_add_filter('muplugins_loaded', '_manually_load_plugin');

// Start up the WP testing environment.
require "{$_tests_dir}/includes/bootstrap.php";

if (file_exists(__DIR__ . '/BaseTestCase.php')) {
    require __DIR__ . '/BaseTestCase.php';
}
