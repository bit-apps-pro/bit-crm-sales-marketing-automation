<?php

namespace BitApps\Crm\src\StaticData;

use BitApps\Crm\Model\Setting;

class CurrencyHelper
{
    public const KEY_HOME_CURRENCY = 'home_currency';

    public const KEY_HOME_CURRENCY_DATA = 'home_currency_data';

    public const COL_PREFIX_HOME_CURRENCY = 'home_currency_';

    public const DEFAULT_HOME_CURRENCY_CODE = 'USD';

    public static function all()
    {
        static $currencies = null;

        if (\is_null($currencies)) {
            $path = __DIR__ . '/currencies.php';
            $currencies = file_exists($path) ? include $path : [];
        }

        return $currencies;
    }

    public static function getCurrencyData(string $currencyCode): ?array
    {
        $currencies = self::all();

        return $currencies[$currencyCode] ?? null;
    }

    public static function getHomeCurrency(): string
    {
        $currency = self::getHomeCurrencyData();

        return isset($currency['currency']) ? $currency['currency'] : self::DEFAULT_HOME_CURRENCY_CODE;
    }

    public static function getHomeCurrencyData(bool $includeMockData = true): array
    {
        $setting = Setting::findOne(['setting_key' => CurrencyHelper::KEY_HOME_CURRENCY_DATA]);

        if (isset($setting['setting_value']) && \is_array($setting['setting_value'])) {
            return $setting['setting_value'];
        }

        if ($includeMockData) {
            return self::getMockedHomeCurrencyData();
        }

        return [];
    }

    private static function getMockedHomeCurrencyData(): array
    {
        $currencyData = self::getCurrencyData(self::DEFAULT_HOME_CURRENCY_CODE);

        if (!\is_array($currencyData)) {
            return [];
        }

        $currencyData['thousand_separator_selector'] = 'international_comma_period';
        $currencyData['symbol'] = $currencyData['symbol'][0];
        $currencyData['currency'] = $currencyData['value'];

        return $currencyData;
    }
}
