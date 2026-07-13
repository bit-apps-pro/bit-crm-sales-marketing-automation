<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;

/**
 * @internal
 *
 * @coversNothing
 */
class CustomFieldStoreTest extends BaseTestCase
{
    private $method;

    private $route;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'POST';

        $this->route = 'custom-field/store';
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
    public function store()
    {
        $this->markTestSkipped('Custom fields moved to pro; test uses free config and needs refactor.');

        $this->call($this->method, $this->route, [
            'module'     => 'lead',
            'field_key'  => 'custom_field_1',
            'label'      => 'Custom Field 1',
            'type'       => 'text',
            'attributes' => [
                'required' => false
            ],
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
    }
}
