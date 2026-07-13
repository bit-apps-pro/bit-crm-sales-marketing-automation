<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;

/**
 * @internal
 *
 * @coversNothing
 */
class LeadStoreTest extends BaseTestCase
{
    private $method;

    private $route;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'POST';

        $this->route = 'leads/store';
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
        $this->call($this->method, $this->route, [
            'systemDefinedFieldsValues' => [
                'first_name'  => 'John',
                'last_name'   => 'Doe',
                'email'       => 'john@mail.com',
                'phone'       => '8801231231231',
                'lead_source' => 'dummy'
            ],
            'customFieldsValues' => [
                'custom_field_1' => ['field_value' => 'value1', 'field_id' => 1],
                'custom_field_2' => ['field_value' => 'value2', 'field_id' => 2]
            ],
            'tagIds' => [],
            'newTagTitles' => [],
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
    }
}
