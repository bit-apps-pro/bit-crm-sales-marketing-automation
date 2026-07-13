<?php

namespace BitApps\Crm\Providers;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\RequestType;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Router\Router;
use BitApps\Crm\HTTP\Controllers\WooCommerceHistoricalSyncController;
use BitApps\Crm\Plugin;
use BitApps\Crm\Services\InvoiceService;
use BitApps\Crm\src\Queue\WooCommerceContactSyncProcess;
use DateTime;

class HookProvider
{
    private $_pluginBackend;

    public function __construct()
    {
        $this->_pluginBackend = Config::get('BASEDIR') . DIRECTORY_SEPARATOR;
        $this->loadAppAjaxHooks();
        Hooks::addAction('rest_api_init', [$this, 'loadAppApiHooks']);
        Hooks::addFilter('safe_style_css', [$this, 'allowStyleProperties']);
        $this->registerWooCommerceHooks();

        Hooks::addAction('bit_crm_invoices_overdue_check', [InvoiceService::class, 'runOverdueInvoiceCheck']);

        /* Re-anchor the daily check when the site's timezone changes, otherwise
         * the event keeps firing at the original UTC instant and drifts away
         * from local midnight.
         */
        Hooks::addAction('update_option_timezone_string', [$this, 'rescheduleOverdueInvoiceCheck']);
        Hooks::addAction('update_option_gmt_offset', [$this, 'rescheduleOverdueInvoiceCheck']);

        $this->scheduleOverdueInvoiceCheck();

        if (Config::getEnv('CLI_ACTIVE')) {
            include_once __DIR__ . '/../../../cli/RegisterCommands.php';
        }
    }

    public function allowStyleProperties($styles)
    {
        $styles[] = 'display';

        return $styles;
    }

    public function loadAppApiHooks()
    {
        if (
            is_readable($this->_pluginBackend . 'hooks' . DIRECTORY_SEPARATOR . 'api.php')
            && RequestType::is(RequestType::API)
        ) {
            $router = new Router(RequestType::API, Config::SLUG, 'v1');
            $router->setMiddlewares(Plugin::instance()->middlewares());

            include $this->_pluginBackend . 'hooks' . DIRECTORY_SEPARATOR . 'api.php';
            $router->register();
        }
    }

    public function queueWooCommerceContactSync(int $orderId): void
    {
        $process = new WooCommerceContactSyncProcess();
        $process->push_to_queue(['order_id' => $orderId])->save()->dispatch();
    }

    /**
     * Clear and re-anchor the daily overdue check to the next local midnight.
     *
     * Hooked to timezone setting changes so the recurring event tracks the new
     * timezone instead of staying pinned to the originally scheduled UTC instant.
     */
    public function rescheduleOverdueInvoiceCheck(): void
    {
        wp_clear_scheduled_hook('bit_crm_invoices_overdue_check');
        $this->scheduleOverdueInvoiceCheck();
    }

    /**
     * Helps to register App hooks.
     */
    protected function loadAppAjaxHooks()
    {
        if (
            RequestType::is(RequestType::AJAX)
            && is_readable($this->_pluginBackend . 'hooks' . DIRECTORY_SEPARATOR . 'ajax.php')
        ) {
            $router = new Router(RequestType::AJAX, Config::VAR_PREFIX, '');
            $router->setMiddlewares(Plugin::instance()->middlewares());

            include $this->_pluginBackend . 'hooks' . DIRECTORY_SEPARATOR . 'ajax.php';
            $router->register();
        }

        if (is_readable($this->_pluginBackend . 'hooks.php')) {
            include $this->_pluginBackend . 'hooks.php';
        }
    }

    private function scheduleOverdueInvoiceCheck(): void
    {
        if (!wp_next_scheduled('bit_crm_invoices_overdue_check')) {
            $midnight = new DateTime('tomorrow midnight', wp_timezone());

            wp_schedule_event($midnight->getTimestamp(), 'daily', 'bit_crm_invoices_overdue_check');
        }
    }

    private function registerWooCommerceHooks(): void
    {
        Hooks::addAction('woocommerce_new_order', [$this, 'queueWooCommerceContactSync']);
        Hooks::addAction('woocommerce_update_order', [$this, 'queueWooCommerceContactSync']);

        $this->maybeDispatchPendingWooHistoricalSync();
    }

    private function maybeDispatchPendingWooHistoricalSync(): void
    {
        if (!Config::getOption('woo_historical_sync_pending')) {
            return;
        }

        Config::deleteOption('woo_historical_sync_pending');
        WooCommerceHistoricalSyncController::maybeDispatch();
    }
}
