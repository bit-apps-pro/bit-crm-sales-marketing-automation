<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;

/**
 * @internal
 *
 * @coversNothing
 */
class GetAllFieldsTest extends BaseTestCase
{
    private $method;

    private $route;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'GET';

        $this->route = 'leads/fields';
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
    public function getAllFields()
    {
        $this->call($this->method, $this->route);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
        $this->assertArrayHasKey('fields', $response['data']);
        $this->assertArrayHasKey('orders', $response['data']);

        $fields = $response['data']['fields'];

        $lastNameField = array_filter($fields, function ($field) {
            return $field['field_key'] === 'last_name';
        });

        $this->assertCount(1, $lastNameField);
        $this->assertIsArray($fields);

        $expectedLastNameField = [
            'type'               => 'text',
            'field_key'          => 'last_name',
            'label'              => 'Last Name',
            'required'           => true,
            'name'               => 'family-name',
            'is_always_required' => true
        ];

        $this->assertEquals($expectedLastNameField, reset($lastNameField));
    }
}
