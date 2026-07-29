<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\Services\IntegrationSettingsService;
use BitApps\Crm\Services\SettingService;
use BitApps\Crm\src\Capability;
use BitApps\Crm\src\Queue\WooCommerceHistoricalSyncProcess;

final class WooCommerceHistoricalSyncController
{
    public function trigger()
    {
        if (!class_exists('WooCommerce')) {
            return Response::error(__('WooCommerce is not active.', 'bit-crm-sales-marketing-automation'));
        }

        $process = new WooCommerceHistoricalSyncProcess();

        if ($process->isProcessing() || $process->isQueued()) {
            return Response::error(__('Sync is already running.', 'bit-crm-sales-marketing-automation'));
        }

        WooCommerceHistoricalSyncProcess::updateState(['status' => 'running', 'page' => 1, 'last_order_id' => 0]);
        $process->push_to_queue(['page' => 1, 'per_page' => 50, 'last_order_id' => 0])->save()->dispatch();

        return Response::success(['status' => 'started']);
    }

    public function progress()
    {
        if (!Capability::check('bit_crm_setting_integration')) {
            return Response::error(__('Unauthorized.', 'bit-crm-sales-marketing-automation'));
        }

        $process = new WooCommerceHistoricalSyncProcess();
        $state = WooCommerceHistoricalSyncProcess::getState();

        return Response::success(
            [
                'status'        => $state['status'] ?? 'idle',
                'current_page'  => $state['page'] ?? 0,
                'last_order_id' => $state['last_order_id'] ?? 0,
                'is_running'    => $process->isProcessing() || $process->isQueued(),
            ]
        );
    }

    /**
     * Dispatch historical sync if conditions are met. State-aware:
     * - running/stopped (interrupted): resume from saved page
     * - idle/completed: fresh sync from page 1
     *
     * Called from activation hook and settings enable transition.
     */
    public static function maybeDispatch(): void
    {
        if (!class_exists('WooCommerce')) {
            return;
        }

        $settings = SettingService::getSettingsValue(IntegrationSettingsService::SETTINGS_KEYS['WOOCOMMERCE_INTEGRATION_SETTINGS']);

        if (empty($settings['sync_enabled'])) {
            return;
        }

        $process = new WooCommerceHistoricalSyncProcess();
        if ($process->isProcessing() || $process->isQueued()) {
            return;
        }

        $state = WooCommerceHistoricalSyncProcess::getState();
        $status = $state['status'] ?? 'idle';

        if (\in_array($status, ['running', 'stopped'], true)) {
            $page = max(1, (int) ($state['page'] ?? 1));
            $lastOrderId = (int) ($state['last_order_id'] ?? 0);
        } else {
            $page = 1;
            $lastOrderId = 0;
        }

        WooCommerceHistoricalSyncProcess::updateState(['status' => 'running', 'page' => $page, 'last_order_id' => $lastOrderId]);
        $process->push_to_queue(['page' => $page, 'per_page' => 50, 'last_order_id' => $lastOrderId])->save()->dispatch();
    }

    public static function markStopped(): void
    {
        $state = WooCommerceHistoricalSyncProcess::getState();
        WooCommerceHistoricalSyncProcess::updateState(
            [
                'status'        => 'stopped',
                'page'          => $state['page'] ?? 0,
                'last_order_id' => $state['last_order_id'] ?? 0,
            ]
        );
    }
}
