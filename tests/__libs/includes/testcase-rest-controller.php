<?php

abstract class WP_Test_REST_Controller_Testcase extends WP_Test_REST_TestCase
{
    protected $server;

    public function set_up()
    {
        parent::set_up();
        add_filter('rest_url', [ $this, 'filter_rest_url_for_leading_slash' ], 10, 2);
        /** @var WP_REST_Server $wp_rest_server */
        global $wp_rest_server;
        $wp_rest_server = new Spy_REST_Server();
        do_action('rest_api_init', $wp_rest_server);
    }

    public function tear_down()
    {
        remove_filter('rest_url', [ $this, 'test_rest_url_for_leading_slash' ], 10, 2);
        /** @var WP_REST_Server $wp_rest_server */
        global $wp_rest_server;
        $wp_rest_server = null;
        parent::tear_down();
    }

    abstract public function testRegisterRoutes();

    abstract public function testContextParam();

    abstract public function testGetItems();

    abstract public function testGetItem();

    abstract public function testCreateItem();

    abstract public function testUpdateItem();

    abstract public function testDeleteItem();

    abstract public function testPrepareItem();

    abstract public function testGetItemSchema();

    public function filter_rest_url_for_leading_slash($url, $path)
    {
        if (is_multisite() || get_option('permalink_structure')) {
            return $url;
        }

        // Make sure path for rest_url has a leading slash for proper resolution.
        if (0 !== strpos($path, '/')) {
            $this->fail(
                sprintf(
                    'REST API URL "%s" should have a leading slash.',
                    $path
                )
            );
        }

        return $url;
    }
}
