<?php
/**
 * Plugin Name:  Bit CRM: Leads, Contacts, Deals & Invoices
 * Description:  WordPress CRM to manage contacts, leads, deals, and invoices and run your whole sales pipeline right from your WordPress dashboard.
 * Version:      1.0.0
 * Author:       Bit Apps
 * Author URI:   https://bitapps.pro
 * Text Domain:  bit-crm
 * Requires PHP: 8.2
 * Requires at least: 5.8
 * Domain Path:  /languages
 * License:      GPL-2.0-or-later.
 */
if (!defined('ABSPATH')) {
    exit;
} // Exit if accessed directly

require_once plugin_dir_path(__FILE__) . 'backend/bootstrap.php';
