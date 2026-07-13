<?php

namespace BitApps\Crm\src\Queue;

use BitApps\Crm\Config;
use BitApps\Crm\Services\PluginInstallerService;
use BitApps\Crm\src\StaticData\OtherPluginsData;
use BitApps\Crm\Utils\Logger;
use Throwable;
use WP_Background_Process;

class InstallPluginsProcess extends WP_Background_Process
{
    protected $action = Config::VAR_PREFIX . 'install_plugins';

    /**
     * Install and activate a single plugin per queue item.
     *
     * @param string $slug Plugin slug pushed to the queue
     *
     * @return bool false to remove the item from the queue
     */
    protected function task($slug)
    {
        $pluginData = OtherPluginsData::getPluginData($slug);

        if (empty($pluginData) || !OtherPluginsData::verifyPluginData($pluginData)) {
            return false;
        }

        try {
            (new PluginInstallerService())->installAndActivatePlugin($pluginData);
        } catch (Throwable $th) {
            Logger::error($th);
        }

        return false;
    }
}
