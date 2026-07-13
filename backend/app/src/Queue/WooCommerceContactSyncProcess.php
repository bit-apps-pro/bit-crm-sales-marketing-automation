<?php

namespace BitApps\Crm\src\Queue;

use BitApps\Crm\Config;
use BitApps\Crm\Services\WooCommerceContactSyncService;
use WP_Background_Process;

class WooCommerceContactSyncProcess extends WP_Background_Process
{
    protected $action = Config::VAR_PREFIX . 'woocommerce_contact_sync';

    protected function task($item)
    {
        $orderId = isset($item['order_id']) ? (int) $item['order_id'] : 0;

        if ($orderId <= 0) {
            return false;
        }

        (new WooCommerceContactSyncService())->syncOrder($orderId);

        return false;
    }
}
