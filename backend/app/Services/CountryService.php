<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;

/**
 * Countries and their states for address fields.
 */
class CountryService
{
    // Spellings other than the code or the listed name, as formatLookupKey() leaves them.
    private const COUNTRY_ALIASES = [
        'USA'                      => 'US',
        'U.S.'                     => 'US',
        'U.S.A.'                   => 'US',
        'UNITED STATES'            => 'US',
        'UNITED STATES OF AMERICA' => 'US',
        'UNITED STATES (US)'       => 'US',
        'AMERICA'                  => 'US',
        'UK'                       => 'GB',
        'U.K.'                     => 'GB',
        'UNITED KINGDOM'           => 'GB',
        'UNITED KINGDOM (UK)'      => 'GB',
        'GREAT BRITAIN'            => 'GB',
        'ENGLAND'                  => 'GB',
        'DEUTSCHLAND'              => 'DE',
        'UAE'                      => 'AE',
        'HOLLAND'                  => 'NL',
        'THE NETHERLANDS'          => 'NL',
        'U.S'                      => 'US',
        'SCOTLAND'                 => 'GB',
        'WALES'                    => 'GB',
        'NORTHERN IRELAND'         => 'GB',
        'OSTERREICH'               => 'AT',
        'SCHWEIZ'                  => 'CH',
        'SUISSE'                   => 'CH',
        'SVIZZERA'                 => 'CH',
        'FRANKREICH'               => 'FR',
        'ESPANA'                   => 'ES',
        'ITALIA'                   => 'IT',
        'NEDERLAND'                => 'NL',
        'BELGIQUE'                 => 'BE',
        'BELGIE'                   => 'BE',
        'POLSKA'                   => 'PL',
        'CZECHIA'                  => 'CZ',
        'CESKO'                    => 'CZ',
        'TURKIYE'                  => 'TR',
        'EIRE'                     => 'IE',
        'SVERIGE'                  => 'SE',
        'DANMARK'                  => 'DK',
        'NORGE'                    => 'NO',
        'SUOMI'                    => 'FI',
        'KANADA'                   => 'CA',
        'BRASIL'                   => 'BR',
        "COTE D'IVOIRE"            => 'CI',
        'REPUBLIC OF KOREA'        => 'KR',
        'RUSSIAN FEDERATION'       => 'RU',
    ];

    // Other spellings of the states the tax rules match on, keyed by country code.
    private const STATE_ALIASES = [
        'CA' => [
            'PQ'                        => 'QC',
            'PEI'                       => 'PE',
            'P.E.I.'                    => 'PE',
            'NEWFOUNDLAND'              => 'NL',
            'NFLD'                      => 'NL',
            'YUKON'                     => 'YT',
            'ONT'                       => 'ON',
            'COLOMBIE-BRITANNIQUE'      => 'BC',
            'NOUVEAU-BRUNSWICK'         => 'NB',
            'NOUVELLE-ECOSSE'           => 'NS',
            'ILE-DU-PRINCE-EDOUARD'     => 'PE',
            'TERRE-NEUVE-ET-LABRADOR'   => 'NL',
            'TERRITOIRES DU NORD-OUEST' => 'NT',
        ],
        'US' => [
            'D.C.'            => 'DC',
            'WASHINGTON DC'   => 'DC',
            'WASHINGTON D.C.' => 'DC',
        ],
    ];

    /**
     * @return array<string, array{value: string, name: string, label: string}> keyed by ISO 3166-1 alpha-2 code
     */
    public function getCountries(): array
    {
        static $countries = null;

        if (\is_null($countries)) {
            $path = Config::get('BASEDIR') . '/app/src/StaticData/countries.php';
            $countries = file_exists($path) ? include $path : [];
        }

        return $countries;
    }

    /**
     * @param null|string $country a country code or a typed country name
     *
     * @return array<string, string> state code => state name
     */
    public function getStates(?string $country): array
    {
        static $states = null;

        if (\is_null($states)) {
            $path = Config::get('BASEDIR') . '/app/src/StaticData/states.php';
            $states = file_exists($path) ? include $path : [];
        }

        return $states[$this->getCountryCode($country)] ?? [];
    }

    /**
     * @param null|string $country a country code or a typed country name
     *
     * @return array<int, array{label: string, value: string}>
     */
    public function getStatesAsOptions(?string $country): array
    {
        $options = [];

        foreach ($this->getStates($country) as $code => $name) {
            $options[] = [
                'label' => $name,
                'value' => (string) $code,
            ];
        }

        return $options;
    }

    public function getCountriesAsOptions(): array
    {
        $options = [];

        foreach ($this->getCountries() as $country) {
            $options[] = [
                'label' => $country['label'],
                'value' => $country['value'],
            ];
        }

        return $options;
    }

    /**
     * @return string the country code, or an empty string when the value is not recognised
     */
    public function getCountryCode(?string $value): string
    {
        $value = $this->formatLookupKey($value);

        if ($value === '') {
            return '';
        }

        static $codesByName = null;
        $countries = $this->getCountries();

        if (isset($countries[$value])) {
            return $value;
        }

        if (\is_null($codesByName)) {
            $codesByName = self::COUNTRY_ALIASES;

            foreach ($countries as $code => $country) {
                $codesByName[$this->formatLookupKey($country['name'])] ??= $code;
                $codesByName[$this->formatLookupKey($country['label'])] ??= $code;
            }
        }

        return $codesByName[$value] ?? '';
    }

    /**
     * @return string the state code, or an empty string when the value is not recognised
     */
    public function getStateCode(string $countryCode, ?string $value): string
    {
        static $codesByName = [];
        $value = $this->formatLookupKey($value);
        $states = $this->getStates($countryCode);

        if ($value === '' || empty($states)) {
            return '';
        }

        if (!isset($codesByName[$countryCode])) {
            $codes = self::STATE_ALIASES[$countryCode] ?? [];

            foreach ($states as $code => $name) {
                $codes[$this->formatLookupKey($name)] ??= (string) $code;
            }

            // "TX", "US-TX" and "BY" (stored as "DE-BY") all match, and a code wins over a name.
            foreach (array_keys($states) as $code) {
                $upperCode = strtoupper((string) $code);
                $codes[$upperCode] = (string) $code;
                $codes[$countryCode . '-' . $upperCode] = (string) $code;

                if (strpos($upperCode, $countryCode . '-') === 0) {
                    $codes[substr($upperCode, \strlen($countryCode) + 1)] = (string) $code;
                }
            }

            $codesByName[$countryCode] = $codes;
        }

        return $codesByName[$countryCode][$value] ?? '';
    }

    /**
     * Typed address countries and states to codes; an unrecognised value is kept as typed.
     *
     * @param array<string, mixed> $fields field values keyed by field key
     *
     * @return array<string, mixed>
     */
    public function formatAddressCodes(array $fields): array
    {
        foreach (['billing', 'shipping'] as $addressType) {
            $countryCode = $this->getCountryCode((string) ($fields[$addressType . '_country'] ?? ''));

            if ($countryCode === '') {
                continue;
            }

            $fields[$addressType . '_country'] = $countryCode;
            $stateCode = $this->getStateCode($countryCode, (string) ($fields[$addressType . '_state'] ?? ''));

            if ($stateCode !== '') {
                $fields[$addressType . '_state'] = $stateCode;
            }
        }

        return $fields;
    }

    /**
     * @return string the country name, or the value as stored when it is not recognised
     */
    public function getCountryLabel(?string $value): string
    {
        $code = $this->getCountryCode($value);

        return $code === '' ? (string) $value : $this->getCountries()[$code]['label'];
    }

    /**
     * @return string the state name, or the value as stored when it is not recognised
     */
    public function getStateLabel(?string $country, ?string $value): string
    {
        $countryCode = $this->getCountryCode($country);
        $stateCode = $this->getStateCode($countryCode, $value);

        return $stateCode === '' ? (string) $value : $this->getStates($countryCode)[$stateCode];
    }

    /**
     * @param array<string, mixed> $fields field values keyed by field key
     *
     * @return array<string, mixed>
     */
    public function formatAddressLabels(array $fields): array
    {
        foreach (['billing', 'shipping'] as $addressType) {
            $country = $fields[$addressType . '_country'] ?? null;

            if (!\is_string($country) || $country === '') {
                continue;
            }

            if (\is_string($fields[$addressType . '_state'] ?? null)) {
                $fields[$addressType . '_state'] = $this->getStateLabel($country, $fields[$addressType . '_state']);
            }

            $fields[$addressType . '_country'] = $this->getCountryLabel($country);
        }

        return $fields;
    }

    /**
     * @param object $record a contact, or anything with billing_country and billing_state
     *
     * @return array{billing_country: string, billing_state: string}
     */
    public function getBillingAddressLabels(object $record): array
    {
        $country = $record->billing_country ?? '';

        return [
            'billing_country' => $this->getCountryLabel($country),
            'billing_state'   => $this->getStateLabel($country, $record->billing_state ?? ''),
        ];
    }

    // The en_US locale keeps "Ö" as "O"; in German remove_accents() would give "OE".
    private function formatLookupKey(?string $value): string
    {
        $value = str_replace(['’', '‘'], "'", trim((string) $value));

        if (\function_exists('remove_accents')) {
            $value = remove_accents($value, 'en_US');
        }

        return strtoupper(preg_replace('/\s+/', ' ', $value));
    }
}
