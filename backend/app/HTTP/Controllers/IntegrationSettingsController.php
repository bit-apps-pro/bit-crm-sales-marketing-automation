<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\Integration\ShowRequest;
use BitApps\Crm\HTTP\Requests\Integration\UpsertRequest;
use BitApps\Crm\Model\Setting;
use BitApps\Crm\Services\WooCommerceProductService;
use Throwable;

final class IntegrationSettingsController
{
    private const WC_INTEGRATION_KEY = 'woocommerce_integration_settings';

    public function show(ShowRequest $request)
    {
        $validated = $request->validated();
        $setting = Setting::findOne(['setting_key' => $validated['setting_key']]);

        return Response::success(
            [
                'setting_value'        => $setting ? $setting->setting_value : null,
                'is_woo_plugin_active' => (new WooCommerceProductService())->isPluginActive(),
            ]
        );
    }

    public function upsert(UpsertRequest $request)
    {
        $validated = $request->validated();
        $existing = Setting::findOne(['setting_key' => $validated['setting_key']]);

        // Read old sync_enabled before overwriting (model holds old value after update())
        $wasEnabled = $existing ? (bool) ($existing->setting_value['sync_enabled'] ?? false) : false;

        try {
            if ($existing) {
                $existing->update(
                    [
                        'setting_value' => $validated['setting_value'],
                        'updated_by'    => get_current_user_id(),
                    ]
                );
            } else {
                Setting::insert(
                    [
                        'setting_key'   => $validated['setting_key'],
                        'setting_value' => $validated['setting_value'],
                        'created_by'    => get_current_user_id(),
                    ]
                );
            }
        } catch (Throwable $th) {
            return Response::error(__('Failed to save settings.', 'bit-crm-sales-marketing-automation'));
        }

        if ($validated['setting_key'] === self::WC_INTEGRATION_KEY) {
            $isNowEnabled = (bool) ($validated['setting_value']['sync_enabled'] ?? false);
            $this->handleWooSyncTransition($wasEnabled, $isNowEnabled);
        }

        return Response::success(__('Settings saved successfully.', 'bit-crm-sales-marketing-automation'));
    }

    public function wooProductIntegration()
    {
        $isWooActive = (new WooCommerceProductService())->isPluginActive();
        $setting = Setting::findOne(['setting_key' => 'integration_settings']);

        $savedValue = $setting ? ($setting->setting_value['enable_woo_products'] ?? null) : null;
        $enableWooProducts = $isWooActive && ($savedValue ?? true);

        return Response::success(
            [
                'enable_woo_products'  => $enableWooProducts,
                'is_woo_plugin_active' => $isWooActive,
            ]
        );
    }

    private function handleWooSyncTransition(bool $wasEnabled, bool $isNowEnabled): void
    {
        if (!$wasEnabled && $isNowEnabled) {
            WooCommerceHistoricalSyncController::maybeDispatch();
        } elseif ($wasEnabled && !$isNowEnabled) {
            WooCommerceHistoricalSyncController::markStopped();
        }
    }
}
