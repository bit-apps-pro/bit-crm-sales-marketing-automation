<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;

/**
 * @internal
 *
 * @coversNothing
 */
class RouteControllerTest extends BaseTestCase
{
    public function setUp() : void
    {
        parent::setUp();
    }

    public function tearDown() : void
    {
        parent::tearDown();
    }

    /**
     * @function testProxyRoute
     * 
     * @group api
     */
    public function testProxyRoute()
    {
        $this->call('GET', 'leads/fields');
        $response = JSON::maybeDecode($this->_last_response);
        $this->assertEquals('success', $response->status);
    }
}
