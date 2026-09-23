<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Services\Privacy\PersonalDataEraser;
use BitApps\Crm\Services\Privacy\PersonalDataExporter;
use BitApps\Crm\Services\Privacy\PrivacyPolicyContent;

/**
 * Integrates Bit CRM with the WordPress privacy tools (WP 4.9.6+):
 * Tools → Export Personal Data, Tools → Erase Personal Data and the
 * Settings → Privacy policy guide. This is the only standard WordPress and the
 * GDPR/compliance plugins built on it consume, so one registration (see
 * HookProvider::registerPrivacyHooks) covers all of them.
 *
 * The pro plugin does not register its own exporter or eraser; it covers its
 * tables through the HookKeys::PRIVACY_* extension points these callbacks fire.
 */
class PrivacyService
{
    public function registerExporter($exporters): array
    {
        $exporters = \is_array($exporters) ? $exporters : [];

        $exporters[Config::SLUG] = [
            'exporter_friendly_name' => Config::TITLE,
            'callback'               => [$this, 'export'],
        ];

        return $exporters;
    }

    public function registerEraser($erasers): array
    {
        $erasers = \is_array($erasers) ? $erasers : [];

        $erasers[Config::SLUG] = [
            'eraser_friendly_name' => Config::TITLE,
            'callback'             => [$this, 'erase'],
        ];

        return $erasers;
    }

    public function addPrivacyPolicyContent(): void
    {
        if (!\function_exists('wp_add_privacy_policy_content')) {
            return;
        }

        wp_add_privacy_policy_content(Config::TITLE, wp_kses_post((new PrivacyPolicyContent())->render()));
    }

    /**
     * WordPress exporter callback.
     *
     * @param mixed $emailAddress
     * @param mixed $page
     *
     * @return array{data: array, done: bool}
     */
    public function export($emailAddress, $page = 1): array
    {
        return (new PersonalDataExporter())->export((string) $emailAddress, (int) $page);
    }

    /**
     * WordPress eraser callback.
     *
     * @param mixed $emailAddress
     * @param mixed $page
     *
     * @return array{items_removed: bool, items_retained: bool, messages: string[], done: bool}
     */
    public function erase($emailAddress, $page = 1): array
    {
        return (new PersonalDataEraser())->erase((string) $emailAddress, (int) $page);
    }
}
