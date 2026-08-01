<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Setting;
use BitApps\Crm\src\StaticData\CurrencyHelper;

class CurrencyService
{
    public function getStoredCurrencies(): array
    {
        $settings = Setting::whereIn(
            'setting_key',
            [
                CurrencyHelper::KEY_HOME_CURRENCY,
                CurrencyHelper::KEY_HOME_CURRENCY_DATA,
            ]
        )->get();

        $result = [
            'homeCurrency'     => null,
            'homeCurrencyData' => [],
            'otherCurrencies'  => [],
        ];

        foreach ($settings as $setting) {
            if ($setting['setting_key'] === CurrencyHelper::KEY_HOME_CURRENCY) {
                $result['homeCurrency'] = $setting['setting_value'] ?? null;
            } elseif ($setting['setting_key'] === CurrencyHelper::KEY_HOME_CURRENCY_DATA) {
                $result['homeCurrencyData'] = $setting['setting_value'] ?? null;
            }
        }

        return Hooks::applyFilter(HookKeys::STORED_CURRENCIES, $result);
    }

    public function getOtherCurrenciesAsOptions(): array
    {
        $homeCurrencyData = CurrencyHelper::getHomeCurrencyData();

        $options = [];
        if (!empty($homeCurrencyData)) {
            $options[] = [
                'label'    => $homeCurrencyData['label'],
                'value'    => $homeCurrencyData['currency'],
                'data'     => $homeCurrencyData,
                'disabled' => false,
            ];
        }

        return Hooks::applyFilter(HookKeys::CURRENCY_OPTIONS, $options);
    }

    public function getCurrencyMap(): array
    {
        $homeCurrencyData = CurrencyHelper::getHomeCurrencyData();
        $otherCurrenciesData = Hooks::applyFilter(HookKeys::OTHER_CURRENCIES_DATA, []);

        return array_merge([$homeCurrencyData['currency'] => $homeCurrencyData], $otherCurrenciesData);
    }

    public function convertIntoHomeCurrency(float $amount, ?string $currency = ''): float
    {
        if ($amount <= 0 || !$currency) {
            return $amount;
        }

        $homeCurrency = CurrencyHelper::getHomeCurrency();
        if ($homeCurrency === $currency) {
            return $amount;
        }

        $currencies = Hooks::applyFilter(HookKeys::OTHER_CURRENCIES_DATA, []);
        $currencyData = $currencies[$currency] ?? [];

        if (!\is_array($currencyData) || !isset($currencyData['exchange_rate'])) {
            return $amount;
        }

        return (float) $amount / $currencyData['exchange_rate'];
    }

    /**
     * Exchange rate from one CRM-known currency to another, pivoting through
     * the home currency (stored rates are foreign-units per home unit).
     *
     * @return null|float null when either currency is unknown to the CRM
     */
    public function getExchangeRate(?string $from, ?string $to): ?float
    {
        $fromRate = $this->ratePerHomeUnit($from);
        $toRate = $this->ratePerHomeUnit($to);

        if ($fromRate === null || $toRate === null) {
            return null;
        }

        return $toRate / $fromRate;
    }

    /**
     * True when the CRM can convert this currency (it is the home currency or
     * has a stored exchange rate).
     */
    public function isKnownCurrency(?string $currency): bool
    {
        return $this->ratePerHomeUnit($currency) !== null;
    }

    /**
     * Units of the given currency per one home-currency unit — the direction
     * the CRM stores exchange rates in (see convertIntoHomeCurrency()).
     */
    private function ratePerHomeUnit(?string $currency): ?float
    {
        if (empty($currency)) {
            return null;
        }

        if ($currency === CurrencyHelper::getHomeCurrency()) {
            return 1.0;
        }

        $currencies = Hooks::applyFilter(HookKeys::OTHER_CURRENCIES_DATA, []);
        $rate = $currencies[$currency]['exchange_rate'] ?? null;

        return is_numeric($rate) && (float) $rate > 0 ? (float) $rate : null;
    }

    public function currencyFormatPreview(array $currency, $number = 0, bool $includeSymbol = true): string
    {
        $sampleNumber = \is_string($number) ? (float) $number : (float) $number;
        $decimalPlaces = (int) ($currency['decimal_places'] ?? 2);
        $thousandSeparator = $currency['thousand_separator'] ?? 'comma';
        $decimalSeparator = $currency['decimal_separator'] ?? 'period';
        $numeralSystem = $currency['numeral_system'] ?? 'international';
        $symbol = $currency['currency'] ?? $currency['symbol'] ?? '';

        // Round the number based on decimal places
        $roundedNumber = $decimalPlaces === 0
            ? round($sampleNumber)
            : round($sampleNumber, $decimalPlaces);

        // Split into integer and decimal parts
        $parts = explode('.', number_format($roundedNumber, $decimalPlaces, '.', ''));
        $integerPart = $parts[0];
        $decimalPart = $parts[1] ?? '';

        // Apply thousand separator based on numeral system
        if ($numeralSystem === 'indian') {
            // Indian numbering system: 1,23,45,678
            $integerPart = preg_replace('/(\d)(?=(\d{2})+(\d{3})$)/', '$1,', $integerPart);
        } else {
            // International numbering system: 1,234,567
            if ($thousandSeparator === 'comma') {
                $integerPart = preg_replace('/\B(?=(\d{3})+(?!\d))/', ',', $integerPart);
            } elseif ($thousandSeparator === 'period') {
                $integerPart = preg_replace('/\B(?=(\d{3})+(?!\d))/', '.', $integerPart);
            } elseif ($thousandSeparator === 'space') {
                $integerPart = preg_replace('/\B(?=(\d{3})+(?!\d))/', ' ', $integerPart);
            }
        }

        // Return formatted number
        if ($decimalPlaces === 0) {
            return $includeSymbol ? $symbol . ' ' . $integerPart : $integerPart;
        }

        $paddedDecimalPart = str_pad($decimalPart, $decimalPlaces, '0', STR_PAD_RIGHT);
        $separator = $decimalSeparator === 'comma' ? ',' : '.';

        return $includeSymbol
            ? $symbol . ' ' . $integerPart . $separator . $paddedDecimalPart
            : $integerPart . $separator . $paddedDecimalPart;
    }
}
