<?php

namespace BitApps\Crm\src\Queue;

use BitApps\Crm\Config;
use BitApps\Crm\Model\Setting;
use BitApps\Crm\Services\SettingService;
use BitApps\Crm\Services\WooCommerceContactSyncService;
use WP_Background_Process;

class WooCommerceHistoricalSyncProcess extends WP_Background_Process
{
    public const SYNC_SETTING_KEY = 'woo_historical_sync';

    protected $action = Config::VAR_PREFIX . 'woo_historical_sync';

    public function isProcessing(): bool
    {
        return $this->is_processing();
    }

    public function isQueued(): bool
    {
        return !$this->is_queue_empty();
    }

    public static function getState(): array
    {
        $setting = Setting::findOne(['setting_key' => self::SYNC_SETTING_KEY]);

        return $setting ? (array) $setting->setting_value : ['status' => 'idle', 'page' => 0, 'last_order_id' => 0];
    }

    public static function updateState(array $state): void
    {
        $existing = Setting::findOne(['setting_key' => self::SYNC_SETTING_KEY]);
        if ($existing) {
            $existing->update(['setting_value' => $state]);
        } else {
            Setting::insert(['setting_key' => self::SYNC_SETTING_KEY, 'setting_value' => $state]);
        }
    }

    protected function task($item)
    {
        if (!class_exists('WooCommerce')) {
            return false;
        }

        $settings = SettingService::getSettingsValue('woocommerce_integration_settings');
        if (empty($settings['sync_enabled'])) {
            self::updateState(['status' => 'stopped', 'page' => $item['page'] ?? 1, 'last_order_id' => $item['last_order_id'] ?? 0]);

            return false;
        }

        $page = (int) ($item['page'] ?? 1);
        $perPage = (int) ($item['per_page'] ?? 50);
        $lastOrderId = (int) ($item['last_order_id'] ?? 0);

        $orders = $this->getWcOrders(
            [
                'limit'   => $perPage,
                'paged'   => $page,
                'orderby' => 'ID',
                'order'   => 'ASC',
            ]
        );

        if (empty($orders)) {
            self::updateState(['status' => 'completed', 'page' => $page, 'last_order_id' => $lastOrderId]);

            return false;
        }

        $service = new WooCommerceContactSyncService();

        foreach ($orders as $order) {
            $service->syncOrder($order);
        }

        $lastOrderId = max(array_map(fn ($o) => $o->get_id(), $orders));

        if (\count($orders) < $perPage) {
            self::updateState(['status' => 'completed', 'page' => $page, 'last_order_id' => $lastOrderId]);

            return false;
        }

        self::updateState(['status' => 'running', 'page' => $page + 1, 'last_order_id' => $lastOrderId]);

        return ['page' => $page + 1, 'per_page' => $perPage, 'last_order_id' => $lastOrderId];
    }

    private function getWcOrders($args)
    {
        if (\function_exists('wc_get_orders')) {
            return wc_get_orders($args);
        }

        return [];
    }
}
