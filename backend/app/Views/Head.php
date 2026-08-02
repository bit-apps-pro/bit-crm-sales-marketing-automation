<?php

namespace BitApps\Crm\Views;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\DateTimeHelper;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\HTTP\Controllers\OnboardingController;

class Head
{
    public const FONT_URL = 'https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap';

    public const MANIFEST_FILE = 'ba-assets-manifest.json';

    /**
     * Enqueue every stylesheet an entry point needs, resolved from the Vite manifest.
     *
     * With the portal entry in the build, Rollup hoists what the two entries share --
     * Tailwind's utilities and antd's base styles among them -- into a common chunk
     * whose CSS is emitted as its own hashed file. Enqueueing only `main-*.css` left
     * that file to be injected by JS after the chunk downloaded, so a slow response
     * painted the layout's own module CSS (including its dark background) with none
     * of the utility classes applied.
     *
     * @param string $handlePrefix Prefix for the generated style handles
     * @param string $entry        Manifest key, relative to the Vite root
     */
    public static function enqueueEntryStyles($handlePrefix, $entry)
    {
        $manifest = self::readManifest();

        if (empty($manifest[$entry])) {
            return false;
        }

        $assetURI = Config::get('ASSET_URI');

        foreach (self::collectEntryStyles($manifest, $entry) as $index => $file) {
            // No version query string: Vite's preload helper skips a chunk's CSS only
            // when an existing <link href> matches exactly, and `?ver=` breaks that
            // match -- leaving it to append a second <link> for the same stylesheet.
            // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.NoExplicitVersion -- Filenames are content-hashed.
            wp_enqueue_style("{$handlePrefix}-{$index}", "{$assetURI}/{$file}", null, null, 'screen');
        }

        return true;
    }

    /**
     * Load the asset libraries.
     *
     * @param string $currentScreen $top_level_page variable for current page
     */
    public function addHeadScripts($currentScreen)
    {
        if (strpos($currentScreen, Config::SLUG) === false) {
            return;
        }

        $version = Config::VERSION;
        $slug = Config::SLUG;
        $codeName = Config::get('BUILD_CODE_NAME');

        wp_enqueue_style($slug . '-googleapis-PRECONNECT', 'https://fonts.googleapis.com', [], $version);
        wp_enqueue_style($slug . '-gstatic-PRECONNECT-CROSSORIGIN', 'https://fonts.gstatic.com', [], $version);
        wp_enqueue_style($slug . '-font', self::FONT_URL, [], $version);

        if (Config::getEnv('DEV')) {
            wp_enqueue_script($slug . '-vite-client-helper-MODULE', Config::getEnv('DEV_URL') . '/src/config/devHotModule.js', [], null);
            wp_enqueue_script($slug . '-vite-client-MODULE', Config::getEnv('DEV_URL') . '/@vite/client', [], null);
            wp_enqueue_script($slug . '-index-MODULE', Config::getEnv('DEV_URL') . '/src/main.tsx', [], null);
        } else {
            // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.NoExplicitVersion -- Intentional; see note below.
            wp_enqueue_script($slug . '-index-MODULE', Config::get('ASSET_URI') . "/main-{$codeName}.js", [], ''); // WARNING: Do not add version in production, it may cause unexpected behavior.
            if (!self::enqueueEntryStyles($slug . '-styles', 'src/main.tsx')) {
                wp_enqueue_style($slug . '-styles', Config::get('ASSET_URI') . "/main-{$slug}-ba-assets-{$codeName}.css", null, $version, 'screen');
            }
        }

        wp_localize_script(Config::SLUG . '-index-MODULE', Config::VAR_PREFIX, self::createConfigVariable());

        if (!wp_script_is('media-upload')) {
            wp_enqueue_media();
        }
    }

    /**
     * Create config variable for js.
     *
     * @return array
     */
    public static function createConfigVariable()
    {
        $frontendVars = Hooks::applyFilter(
            Config::withPrefix('localized_script'),
            [
                'nonce'               => wp_create_nonce('wp_rest'),
                'rootURL'             => Config::get('ROOT_URI'),
                'siteUrl'             => Config::get('SITE_URL'),
                'siteBaseURL'         => is_multisite() ? network_site_url() : site_url(),
                'assetsURL'           => Config::get('ASSET_URI'),
                'baseURL'             => Config::get('ADMIN_URL') . 'admin.php?page=' . Config::SLUG . '#',
                'ajaxURL'             => admin_url('admin-ajax.php'),
                'apiURL'              => Config::get('API_BASE'),
                'routePrefix'         => Config::VAR_PREFIX,
                'settings'            => Config::getOption('settings'),
                'dateFormat'          => Config::getOption('date_format', false, true),
                'timeFormat'          => Config::getOption('time_format', false, true),
                'timeZone'            => DateTimeHelper::wp_timezone_string(),
                'pluginSlug'          => Config::SLUG,
                'uploadBaseUrl'       => Config::get('UPLOAD_BASE_URL'),
                'version'             => Config::VERSION,
                'capabilities'        => Config::get('capabilities'),
                'homeCurrencyData'    => Config::get('HOME_CURRENCY_DATA'),
                'currentUserId'       => get_current_user_id(),
                'loggedInUserName'    => wp_get_current_user()->display_name ?: wp_get_current_user()->user_login,
                'onboardingCompleted' => Config::getOption(OnboardingController::KEY_ONBOARDING_COMPLETED, false),
            ]
        );
        if (get_locale() !== 'en_US' && file_exists(Config::get('BASEDIR') . '/languages/generatedString.php')) {
            include_once Config::get('BASEDIR') . '/languages/generatedString.php';
            $frontendVars['translations'] = Config::withPrefix('i18n_strings');
        }

        return $frontendVars;
    }

    /**
     * The entry's own CSS plus the CSS of every chunk it statically imports, in
     * dependency order so resets and base styles land before what overrides them.
     *
     * @param array  $manifest
     * @param string $entry
     * @param mixed $visited
     *
     * @return array
     */
    private static function collectEntryStyles($manifest, $entry, &$visited = [])
    {
        if (isset($visited[$entry]) || empty($manifest[$entry])) {
            return [];
        }

        $visited[$entry] = true;
        $styles = [];

        // Imports first: a chunk's dependencies define the base its own rules build on.
        foreach ($manifest[$entry]['imports'] ?? [] as $import) {
            $styles = array_merge($styles, self::collectEntryStyles($manifest, $import, $visited));
        }

        return array_values(array_unique(array_merge($styles, $manifest[$entry]['css'] ?? [])));
    }

    /**
     * Read the build manifest once per request, empty when it is not present.
     *
     * @return array
     */
    private static function readManifest()
    {
        static $manifest = null;

        if ($manifest !== null) {
            return $manifest;
        }

        $path = Config::get('ASSET_DIR') . '/' . self::MANIFEST_FILE;

        if (!file_exists($path)) {
            return $manifest = [];
        }

        $decoded = json_decode(file_get_contents($path), true);

        return $manifest = \is_array($decoded) ? $decoded : [];
    }
}
