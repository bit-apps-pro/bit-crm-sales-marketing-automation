<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Model\Setting;
use BitApps\Crm\src\StaticData\InvoiceSystemDefinedTerms;

class InvoiceTermService
{
    public const STATUS_ALL = 'all';

    public const TERMS_SETTING_KEY = 'invoice_terms';

    public function getAllTerms()
    {
        $setting = Setting::findOne(['setting_key' => self::TERMS_SETTING_KEY]);
        $systemDefinedTerms = InvoiceSystemDefinedTerms::all();

        return $setting ? $setting->setting_value : $systemDefinedTerms;
    }

    public function getPaginatedTerms(int $page, int $perPage, string $searchTerm = '')
    {
        $terms = array_values($this->getAllTerms());

        if ($searchTerm !== '') {
            $lower = strtolower($searchTerm);
            $terms = array_values(
                array_filter(
                    $terms,
                    function ($term) use ($lower) {
                        return strpos(strtolower($term['name'] ?? ''), $lower) !== false;
                    }
                )
            );
        }

        $total = \count($terms);
        $offset = ($page - 1) * $perPage;
        $data = \array_slice($terms, $offset, $perPage);

        return [
            'data'        => $data,
            'total'       => $total,
            'currentPage' => $page,
            'perPage'     => $perPage,
            'lastPage'    => (int) ceil($total / $perPage),
        ];
    }

    public function getTermsAsOptions()
    {
        $terms = $this->getAllTerms();

        return array_map(
            function ($term) {
                return [
                    'label' => $term['name'],
                    'value' => $term['key'],
                    'days'  => $term['days'],
                ];
            },
            array_values($terms)
        );
    }

    public function upsertTerms(array $terms): bool
    {
        $settingKey = self::TERMS_SETTING_KEY;

        $setting = Setting::findOne(['setting_key' => $settingKey]);

        if ($setting) {
            return (bool) $setting->update(['setting_value' => $terms]);
        }

        return (bool) Setting::insert(
            [
                'setting_key'   => $settingKey,
                'setting_value' => $terms,
            ]
        );
    }
}
