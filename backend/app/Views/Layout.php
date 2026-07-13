<?php

// phpcs:disable Squiz.NamingConventions.ValidVariableName.NotCamelCaps

namespace BitApps\Crm\Views;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Utils\Capabilities;
use BitApps\Crm\HTTP\Controllers\OnboardingController;

/**
 * The admin Layout and page handler class.
 */
final class Layout
{
    public const FONT_URL = 'https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap';

    public function __construct()
    {
        Hooks::addAction('in_admin_header', [$this, 'removeAdminNotices']);
        Hooks::addAction('admin_menu', [$this, 'sideBarMenuItem']);
        Hooks::addAction('admin_enqueue_scripts', [new Head(), 'addHeadScripts'], 0);
        Hooks::addFilter('admin_body_class', [$this, 'addOnboardingBodyClass']);
    }

    /**
     * Register the admin left sidebar menu item.
     */
    public function sideBarMenuItem()
    {
        $menus = Hooks::applyFilter(Config::withPrefix('admin_sidebar_menu'), Config::get('SIDE_BAR_MENU'));
        global $submenu;
        foreach ($menus as $menu) {
            if (isset($menu['capability']) && $cap = $this->resolveMenuCapability($menu['capability'])) {
                if ($menu['type'] === 'menu') {
                    add_menu_page(
                        $menu['title'],
                        $menu['name'],
                        $cap,
                        $menu['slug'],
                        $menu['callback'],
                        $menu['icon'],
                        $menu['position']
                    );
                } else {
                    $submenu[$menu['parent']][] = [$menu['name'], $cap, 'admin.php?page=' . $menu['slug']];
                }
            }
        }
    }

    /**
     * Add the full-screen onboarding body class on first paint.
     *
     * Until onboarding is completed the React app forces the user onto the
     * onboarding route, so adding the class server-side hides the WordPress
     * dashboard chrome immediately and avoids a flash before the app boots. The
     * Onboarding component removes it again on unmount.
     *
     * @param string $classes
     *
     * @return string
     */
    public function addOnboardingBodyClass($classes)
    {
        global $plugin_page;
        if (empty($plugin_page) || $plugin_page !== Config::SLUG) {
            return $classes;
        }

        if (Config::getOption(OnboardingController::KEY_ONBOARDING_COMPLETED, false)) {
            return $classes;
        }

        return trim($classes . ' bit-crm-onboarding-fullscreen');
    }

    public function removeAdminNotices()
    {
        global $plugin_page;
        if (empty($plugin_page) || strpos($plugin_page, Config::SLUG) === false) {
            return;
        }

        remove_all_actions('admin_notices');
        remove_all_actions('all_admin_notices');
    }

    private function resolveMenuCapability($menuCapability)
    {
        if (Capabilities::check('administrator')) {
            return 'administrator';
        }

        if (Capabilities::check($menuCapability)) {
            return $menuCapability;
        }

        return false;
    }
}
