<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;

/**
 * Resolves the first path segment of the plugin's public URLs — the shared
 * invoice page (`/<prefix>/invoice`) and the pro client portal
 * (`/<prefix>/portal`). Free always serves Config::PUBLIC_URL_PREFIX; pro
 * swaps in the site's configured prefix through PREFIX_FILTER.
 */
class PublicUrlPrefixService
{
    /**
     * Pro returns the prefix configured under Portal Settings (validated on
     * save by UrlPrefixRule).
     *
     * apply_filters(string $prefix): string
     */
    public const PREFIX_FILTER = 'bit_crm/public_url_prefix';

    public function getPrefix(): string
    {
        $prefix = Hooks::applyFilter(self::PREFIX_FILTER, Config::PUBLIC_URL_PREFIX);

        return \is_string($prefix) && $prefix !== '' ? $prefix : Config::PUBLIC_URL_PREFIX;
    }

    /**
     * Site-relative path of a public page, e.g. `bit-crm/invoice`.
     */
    public function buildPath(string $pageSlug): string
    {
        return $this->getPrefix() . '/' . $pageSlug;
    }

    public function buildUrl(string $pageSlug): string
    {
        return home_url('/' . $this->buildPath($pageSlug));
    }
}
