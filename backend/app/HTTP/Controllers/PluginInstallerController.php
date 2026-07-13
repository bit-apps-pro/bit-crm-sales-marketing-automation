<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\Deps\BitApps\WPKit\Utils\Capabilities;
use BitApps\Crm\HTTP\Requests\PluginInstaller\InstallRequest;
use BitApps\Crm\HTTP\Requests\PluginInstaller\PluginInfoRequest;
use BitApps\Crm\Services\BitSMTPIntegrationService;
use BitApps\Crm\Services\PluginInstallerService;
use BitApps\Crm\src\StaticData\OtherPluginsData;
use Throwable;

final class PluginInstallerController
{
    private PluginInstallerService $pluginInstallerService;

    public function __construct()
    {
        $this->pluginInstallerService = new PluginInstallerService();
    }

    public function install(InstallRequest $request)
    {
        $validated = $request->validated();
        $pluginData = OtherPluginsData::getPluginData($validated['slug']);

        if (empty($pluginData) || !OtherPluginsData::verifyPluginData($pluginData)) {
            return Response::error(null)->message(__('Invalid plugin data or plugin not found!', 'bit-crm'));
        }

        try {
            $this->pluginInstallerService->installAndActivatePlugin($pluginData);

            // translators: %s: plugin slug
            return Response::success(null)->message(\sprintf(__('Plugin "%s" has been installed and activated successfully.', 'bit-crm'), $pluginData['slug']));
        } catch (Throwable $th) {
            return Response::error(null)->message($th->getMessage());
        }
    }

    public function pluginInfo(PluginInfoRequest $request)
    {
        $validated = $request->validated();
        $pluginData = OtherPluginsData::getPluginData($validated['slug']);

        $data = [
            'isInstalled'       => is_plugin_active($pluginData['path'] ?? ''),
            'url'               => Config::get('ADMIN_URL') . 'admin.php?page=' . $validated['slug'],
            'canInstallPlugins' => Capabilities::check('install_plugins'),
            'additionalInfo'    => $this->getAdditionalInfo($pluginData),
        ];

        return Response::success($data);
    }

    private function getAdditionalInfo(array $pluginData): array
    {
        switch ($pluginData['slug']) {
            case BitSMTPIntegrationService::PLUGIN_SLUG:
                return [
                    'smtpConfig' => (new BitSMTPIntegrationService())->getViewOnlyConfig(),
                ];

            default:
                return [];
        }
    }
}
