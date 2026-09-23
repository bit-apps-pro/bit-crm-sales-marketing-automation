<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;

/**
 * The "erase all plugin data on deletion" consent.
 *
 * Stored as a plain option rather than a Setting row so it is readable during
 * uninstall, when nothing but the option table can be relied on.
 */
final class UninstallSettingService
{
    public const ERASE_OPTION = 'erase_on_uninstall';

    public function settings(): array
    {
        return [
            self::ERASE_OPTION => $this->isEraseEnabled(),
        ];
    }

    public function isEraseEnabled(): bool
    {
        return (bool) Config::getOption(self::ERASE_OPTION, false);
    }

    public function updateEraseEnabled(bool $enabled): bool
    {
        return Config::updateOption(self::ERASE_OPTION, $enabled ? 1 : 0);
    }
}
