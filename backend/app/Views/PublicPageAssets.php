<?php

namespace BitApps\Crm\Views;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use WP_Dependencies;

/**
 * Keeps theme and third-party assets off the plugin's standalone pages.
 *
 * The public invoice page and the client portal are app shells that still
 * print wp_head()/wp_footer(), so everything the active theme and other
 * plugins enqueue on the frontend lands on them. A theme reset is enough to
 * break the app: Bricks ships `html{font-size:62.5%}` and
 * `body{display:flex;flex-direction:column}`, which shrank every rem-sized
 * text and squeezed the layout. Dequeueing known handles one by one cannot
 * keep up with every theme, so instead only the plugin's own handles (plus
 * their dependencies and anything allowed through
 * HookKeys::PUBLIC_PAGE_ASSET_HANDLES) are printed.
 *
 * The shells pair this with wp_print_footer_scripts() instead of wp_footer():
 * markup other plugins print on wp_footer (cart drawers, checkout modals)
 * would otherwise sit unstyled below the app once its stylesheet is dropped.
 */
final class PublicPageAssets
{
    /**
     * Restricts the styles and scripts WordPress prints on the current
     * request to the plugin's own. Call before wp_head() runs.
     */
    public static function restrictToPlugin(): void
    {
        Hooks::addFilter('print_styles_array', [self::class, 'filterStyles'], PHP_INT_MAX);
        Hooks::addFilter('print_scripts_array', [self::class, 'filterScripts'], PHP_INT_MAX);
    }

    /**
     * print_styles_array callback.
     *
     * @param mixed $handles
     */
    public static function filterStyles($handles): array
    {
        return self::keepPluginHandles((array) $handles, wp_styles());
    }

    /**
     * print_scripts_array callback.
     *
     * @param mixed $handles
     */
    public static function filterScripts($handles): array
    {
        return self::keepPluginHandles((array) $handles, wp_scripts());
    }

    /**
     * Filters a list of handles down to the plugin's own (prefixed with the
     * plugin slug), the handles they depend on, and the handles allowed
     * through the HookKeys::PUBLIC_PAGE_ASSET_HANDLES filter. Order is kept.
     *
     * @param string[] $handles
     */
    public static function keepPluginHandles(array $handles, WP_Dependencies $dependencies): array
    {
        $allowed = Hooks::applyFilter(HookKeys::PUBLIC_PAGE_ASSET_HANDLES, []);
        $allowed = \is_array($allowed) ? array_filter($allowed, 'is_string') : [];

        $keep = [];

        foreach ($handles as $handle) {
            if (strpos((string) $handle, Config::SLUG) === 0 || \in_array($handle, $allowed, true)) {
                self::collect((string) $handle, $dependencies, $keep);
            }
        }

        return array_values(array_filter($handles, static function ($handle) use ($keep) {
            return isset($keep[$handle]);
        }));
    }

    /**
     * Marks a handle and, recursively, everything it depends on as kept.
     *
     * @param array<string, true> $keep
     */
    private static function collect(string $handle, WP_Dependencies $dependencies, array &$keep): void
    {
        if (isset($keep[$handle])) {
            return;
        }

        $keep[$handle] = true;

        if (!isset($dependencies->registered[$handle])) {
            return;
        }

        foreach ((array) $dependencies->registered[$handle]->deps as $dependency) {
            self::collect((string) $dependency, $dependencies, $keep);
        }
    }
}
