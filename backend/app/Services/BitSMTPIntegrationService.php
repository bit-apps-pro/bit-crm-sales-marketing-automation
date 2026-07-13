<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\src\StaticData\OtherPluginsData;
use BitApps\SMTP\Plugin as BitSmtpPlugin;
use Throwable;

class BitSMTPIntegrationService
{
    public const PLUGIN_SLUG = 'bit-smtp';

    public function getViewOnlyConfig(): array|false
    {
        $pluginData = OtherPluginsData::getPluginData(self::PLUGIN_SLUG);

        if (empty($pluginData) || !is_plugin_active($pluginData['path'] ?? '')) {
            return false;
        }

        if (!class_exists(BitSmtpPlugin::class)) {
            return false;
        }

        try {
            return BitSmtpPlugin::instance()->mailConfigService()->getViewOnlyConfig();
        } catch (Throwable $th) {
            return false;
        }
    }
}
