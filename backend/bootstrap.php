<?php

use BitApps\Crm\Dotenv;
use BitApps\Crm\Plugin;

if (!defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/../vendor/autoload.php';

Dotenv::load(plugin_dir_path(__DIR__) . '.env');

Plugin::load();
