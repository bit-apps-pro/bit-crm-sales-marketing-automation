<?php

namespace BitApps\Crm\Services;

use Automatic_Upgrader_Skin;
use Exception;
use WP_Upgrader;

class PluginInstallerService
{
    /**
     * Install and activate a WordPress plugin from the repository.
     *
     * @param array  $pluginData Plugin information array with 'name', 'slug', and 'file'
     *
     * @throws Exception When plugin installation or activation fails
     */
    public function installAndActivatePlugin(array $pluginData): void
    {
        if (empty($pluginData['slug'])) {
            throw new Exception('Plugin slug is required');
        }

        $this->loadWordPressDependencies();

        $pluginSlug = $pluginData['slug'];
        $pluginStatus = $this->checkPluginStatus($pluginData['path']);

        if (!$pluginStatus['isInstalled']) {
            $this->installPluginFromRepository($pluginSlug);
            $pluginStatus['shouldActivate'] = true;
        }

        wp_clean_plugins_cache();

        if ($pluginStatus['shouldActivate']) {
            $this->activatePlugin($pluginData['path']);
        }
    }

    /**
     * Check if a plugin is installed.
     *
     * @param string $pluginPath Relative plugin file path (e.g. "bit-form/bitforms.php")
     */
    public function isPluginInstalled(string $pluginPath): bool
    {
        return \array_key_exists($pluginPath, get_plugins());
    }

    /**
     * Check if a plugin is active.
     *
     * @param string $pluginPath Relative plugin file path (e.g. "bit-form/bitforms.php")
     */
    public function isPluginActive(string $pluginPath): bool
    {
        return is_plugin_active($pluginPath);
    }

    /**
     * Load required WordPress files for plugin installation.
     */
    private function loadWordPressDependencies(): void
    {
        require_once ABSPATH . 'wp-admin/includes/file.php';

        require_once ABSPATH . 'wp-admin/includes/plugin-install.php';

        require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

        require_once ABSPATH . 'wp-admin/includes/plugin.php';

        WP_Filesystem();
    }

    /**
     * Check if a plugin is installed and determine if it should be activated.
     *
     * @return array Status information with 'isInstalled' and 'shouldActivate' keys
     */
    private function checkPluginStatus(string $pluginPath): array
    {
        $plugins = get_plugins();
        $isInstalled = \array_key_exists($pluginPath, $plugins);
        $shouldActivate = false;

        if ($isInstalled) {
            $shouldActivate = !is_plugin_active($pluginPath);
        }

        return [
            'isInstalled'    => $isInstalled,
            'shouldActivate' => $shouldActivate,
        ];
    }

    /**
     * Install a plugin from the WordPress repository.
     *
     * @param string $pluginSlug Plugin repository slug
     *
     * @throws Exception When plugin information retrieval, download, or installation fails
     */
    private function installPluginFromRepository(string $pluginSlug): void
    {
        ob_start();

        try {
            $upgrader = $this->createUpgrader();
            $pluginInfo = $this->fetchPluginInformation($pluginSlug);
            $packagePath = $this->downloadPluginPackage($upgrader, $pluginInfo->download_link);
            $workingDirectory = $this->unpackPluginPackage($upgrader, $packagePath);
            $this->installPluginPackage($upgrader, $workingDirectory);
        } catch (Exception $exception) {
            ob_end_clean();

            throw $exception;
        }

        ob_end_clean();
    }

    /**
     * Create a WordPress upgrader instance.
     */
    private function createUpgrader(): WP_Upgrader
    {
        $skin = new Automatic_Upgrader_Skin();

        return new WP_Upgrader($skin);
    }

    /**
     * Fetch plugin information from the WordPress repository.
     *
     * @param string $pluginSlug Plugin repository slug
     *
     * @throws Exception When plugin information cannot be retrieved
     *
     * @return object Plugin information object
     */
    private function fetchPluginInformation(string $pluginSlug): object
    {
        $pluginInfo = plugins_api(
            'plugin_information',
            [
                'slug'   => $pluginSlug,
                'fields' => [
                    'short_description' => false,
                    'sections'          => false,
                    'requires'          => false,
                    'rating'            => false,
                    'ratings'           => false,
                    'downloaded'        => false,
                    'last_updated'      => false,
                    'added'             => false,
                    'tags'              => false,
                    'homepage'          => false,
                    'donate_link'       => false,
                    'author_profile'    => false,
                    'author'            => false,
                ],
            ]
        );

        if (is_wp_error($pluginInfo)) {
            // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
            throw new Exception($pluginInfo->get_error_message());
        }

        return $pluginInfo;
    }

    /**
     * Download the plugin package.
     *
     * @param WP_Upgrader $upgrader   WordPress upgrader instance
     * @param string      $packageUrl URL to the plugin package
     *
     * @throws Exception When package download fails
     *
     * @return string Path to the downloaded package
     */
    private function downloadPluginPackage(WP_Upgrader $upgrader, string $packageUrl): string
    {
        $downloadPath = $upgrader->download_package($packageUrl);

        if (is_wp_error($downloadPath)) {
            // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
            throw new Exception($downloadPath->get_error_message());
        }

        return $downloadPath;
    }

    /**
     * Unpack the plugin package.
     *
     * @param WP_Upgrader $upgrader     WordPress upgrader instance
     * @param string      $packagePath  Path to the downloaded package
     *
     * @throws Exception When package unpacking fails
     *
     * @return string Path to the unpacked working directory
     */
    private function unpackPluginPackage(WP_Upgrader $upgrader, string $packagePath): string
    {
        $workingDirectory = $upgrader->unpack_package($packagePath, true);

        if (is_wp_error($workingDirectory)) {
            // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
            throw new Exception($workingDirectory->get_error_message());
        }

        return $workingDirectory;
    }

    /**
     * Install the plugin package.
     *
     * @param WP_Upgrader $upgrader          WordPress upgrader instance
     * @param string      $workingDirectory  Path to the unpacked working directory
     *
     * @throws Exception When package installation fails
     */
    private function installPluginPackage(WP_Upgrader $upgrader, string $workingDirectory): void
    {
        $result = $upgrader->install_package(
            [
                'source'                      => $workingDirectory,
                'destination'                 => WP_PLUGIN_DIR,
                'clear_destination'           => false,
                'abort_if_destination_exists' => false,
                'clear_working'               => true,
                'hook_extra'                  => [
                    'type'   => 'plugin',
                    'action' => 'install',
                ],
            ]
        );

        if (is_wp_error($result)) {
            // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
            throw new Exception($result->get_error_message());
        }
    }

    /**
     * Activate a WordPress plugin.
     *
     * @param string $pluginPath Full path to the plugin file
     *
     * @throws Exception When plugin activation fails
     */
    private function activatePlugin(string $pluginPath): void
    {
        $result = activate_plugin($pluginPath);

        if (is_wp_error($result)) {
            // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
            throw new Exception($result->get_error_message());
        }
    }
}
