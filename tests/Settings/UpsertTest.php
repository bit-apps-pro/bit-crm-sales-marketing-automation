<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;

/**
 * @internal
 *
 * @coversNothing
 */
class UpsertTest extends BaseTestCase
{
    private $method;

    private $route;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'POST';

        $this->route = 'settings/upsert';
    }

    public function tearDown() : void
    {
        parent::tearDown();
    }

    /**
     * @test
     * 
     * @group api
     */
    public function upsert()
    {
        $this->call($this->method, $this->route, [
            'setting_key'   => 'lead_fields_order',
            'setting_value' => [
                ['field_key' => 'first_name', 'order' => 0],
                ['field_key' => 'last_name', 'order' => 1],
                ['field_key' => 'email', 'order' => 2]
            ]
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
    }
}
