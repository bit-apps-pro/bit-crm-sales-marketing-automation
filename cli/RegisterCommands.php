<?php

use BitApps\Crm\CLI\DatabaseCommands;
use BitApps\Crm\CLI\ModelCommand;
use BitApps\Crm\CLI\PluginCommands;
use BitApps\Crm\Config;

if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command(Config::SLUG . ' db', new DatabaseCommands());
    WP_CLI::add_command(Config::SLUG . ' use', new PluginCommands());
    WP_CLI::add_command(Config::SLUG, new ModelCommand());
}
