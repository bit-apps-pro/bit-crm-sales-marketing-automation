<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPDatabase\Connection;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\Currency\HomeCurrencyStoreRequest;
use BitApps\Crm\Model\Setting;
use BitApps\Crm\Services\CurrencyService;
use BitApps\Crm\src\StaticData\CurrencyHelper;
use Throwable;

final class CurrencyController
{
    private CurrencyService $currencyService;

    public function __construct()
    {
        $this->currencyService = new CurrencyService();
    }

    public function index()
    {
        $storedCurrencies = $this->currencyService->getStoredCurrencies();

        return Response::success($storedCurrencies);
    }

    public function staticData()
    {
        $homeCurrencyData = CurrencyHelper::getHomeCurrencyData();
        $storedCurrencies = !empty($homeCurrencyData) ? [$homeCurrencyData] : [];
        $storedCurrencies = Hooks::applyFilter(HookKeys::STATIC_STORED_CURRENCIES, $storedCurrencies);

        $data = [
            'staticData'       => CurrencyHelper::all(),
            'storedCurrencies' => $storedCurrencies,
        ];

        return Response::success($data);
    }

    public function storeHomeCurrency(HomeCurrencyStoreRequest $request)
    {
        $validated = $request->validated();
        $currencyCode = $validated['currency'];
        $homeCurrencySettings = Setting::findOne(['setting_key' => CurrencyHelper::KEY_HOME_CURRENCY_DATA]);

        if (!empty($homeCurrencySettings)) {
            return Response::error(null)->message(__('Home currency is already set!', 'bit-crm-sales-marketing-automation'));
        }

        $currencyData = CurrencyHelper::getCurrencyData($currencyCode);

        if (empty($currencyData)) {
            return Response::error(null)->message(__('Invalid currency selected!', 'bit-crm-sales-marketing-automation'));
        }

        $validated['label'] = $currencyData['label'];

        Connection::startTransaction();

        try {
            $result = Setting::insert(
                [
                    [
                        'setting_key'   => CurrencyHelper::KEY_HOME_CURRENCY,
                        'setting_value' => $currencyCode,
                        'created_by'    => get_current_user_id(),
                    ],
                    [
                        'setting_key'   => CurrencyHelper::KEY_HOME_CURRENCY_DATA,
                        'setting_value' => $validated,
                        'created_by'    => get_current_user_id(),
                    ],
                ]
            );

            $currencyResult = $result->toArray();
            Connection::commit();

            $hasHomeCurrencyData = isset($currencyResult[1])
            && \is_array($currencyResult[1])
            && isset($currencyResult[1]['setting_value'])
            && \is_array($currencyResult[1]['setting_value']);

            if (!$hasHomeCurrencyData) {
                return Response::error(null)->message(__('Failed to set home currency!', 'bit-crm-sales-marketing-automation'));
            }

            return Response::success($currencyResult[1]['setting_value'])->message(__('Home currency set successfully.', 'bit-crm-sales-marketing-automation'));
        } catch (Throwable $th) {
            Connection::rollBack();

            return Response::error(null)->message(__('Failed to set home currency!', 'bit-crm-sales-marketing-automation'));
        }
    }

    public function updateHomeCurrency(HomeCurrencyStoreRequest $request)
    {
        $validated = $request->validated();
        $homeCurrencyDataSetting = Setting::findOne(['setting_key' => CurrencyHelper::KEY_HOME_CURRENCY_DATA]);
        $homeCurrencyData = $homeCurrencyDataSetting['setting_value'] ?? [];

        if (empty($homeCurrencyData)) {
            return Response::error(null)->message(__('Home currency not found!', 'bit-crm-sales-marketing-automation'));
        }

        if ($homeCurrencyData['currency'] !== $validated['currency']) {
            return Response::error(null)->message(__('Invalid currency!', 'bit-crm-sales-marketing-automation'));
        }

        $homeCurrencyData = array_merge($homeCurrencyData, $validated);

        try {
            $homeCurrencyDataSetting->update(['setting_value' => $homeCurrencyData, 'updated_by' => get_current_user_id()]);

            return Response::success($homeCurrencyData)->message(__('Home currency updated successfully.', 'bit-crm-sales-marketing-automation'));
        } catch (Throwable $th) {
            return Response::error(null)->message(__('Failed to update home currency!', 'bit-crm-sales-marketing-automation'));
        }
    }
}
