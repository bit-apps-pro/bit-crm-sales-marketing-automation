<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Http\RequestType;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Router\Router;
use BitApps\Crm\Plugin;

abstract class BaseTestCase extends WP_Test_REST_TestCase
{
    protected $server;

    protected $_last_response;

    protected function setUp(): void
    {
        parent::setUp();

        if (defined('TEST_API')) {
            global $wp_rest_server;
            $this->server = new WP_REST_Server();
            $wp_rest_server = $this->server;
            do_action('rest_api_init');
        } elseif (!defined('DOING_AJAX')) {
            define('DOING_AJAX', true);
        }

        $userId = username_exists('admin');

        if (!$userId) {
            $userId = wp_create_user('admin', 'password', 'admin@example.org');

            wp_set_current_user($userId);

            wp_update_user(['ID' => $userId, 'role' => 'administrator']);
        } else {
            wp_set_current_user($userId);
        }
    }

    protected function call($method, $route, $data = [])
    {
        if (defined('TEST_API')) {
            $this->callRest($method, $route, $data);
        } else {
            $data['_ajax_nonce'] = wp_create_nonce(Config::withPrefix('nonce'));
            $this->callAjax($method, $route, $data);
        }
    }

    protected function getLastRecord(string $table)
    {
        if (!defined('DB_NAME') || !defined('TABLE_PREFIX')) {
            return false;
        }

        global $wpdb;

        $tableWithPrefix = esc_sql(TABLE_PREFIX . Config::VAR_PREFIX . $table);
        $query = "SELECT * FROM {$tableWithPrefix} ORDER BY id DESC";
        $result = $wpdb->get_row($query, ARRAY_A);

        if (!empty($wpdb->last_error) || empty($result)) {
            return false;
        }

        return $result;
    }

    private function callAjax($method, $route, $data)
    {
        $_SERVER['REQUEST_METHOD'] = $method;
        if (strtoupper($method) === 'GET') {
            $_GET = $data;
        } else {
            $_POST = $data;
        }
        $actionPrefix = '';
        if (
            class_exists(Config::class)
            && defined(Config::class . '::VAR_PREFIX')
        ) {
            $actionPrefix = Config::VAR_PREFIX;
        }

        $_REQUEST['action'] = $actionPrefix . $route;
        if (is_readable(dirname(__DIR__) . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'hooks' . DIRECTORY_SEPARATOR . 'ajax.php')) {
            $router = new Router(RequestType::AJAX, Config::VAR_PREFIX, '');
            $router->setMiddlewares(Plugin::instance()->middlewares());
            include dirname(__DIR__) . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'hooks' . DIRECTORY_SEPARATOR . 'ajax.php';
            $router->register();
        }

        try {
            $this->_handleAjax($actionPrefix . $route);
            $this->fail('Expected exception: WPAjaxDieContinueException');
        } catch (WPAjaxDieContinueException $e) {
            // We expected this, do nothing.
        }
    }

    private function callRest($method, $route, $data)
    {
        $routePrefix = '';
        if (
            class_exists(Config::class)
            && defined(Config::class . '::SLUG')
        ) {
            $routePrefix = '/' . Config::SLUG . '/v1/';
        }

        $request = new WP_REST_Request($method, $routePrefix . $route);
        $request->set_body_params($data);
        $response = $this->server->dispatch($request);
        $this->_last_response = $response->get_data();
        if (!is_string($this->_last_response)) {
            $this->_last_response = wp_json_encode($response->get_data());
        }
    }
}
