<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;

/**
 * @internal
 *
 * @coversNothing
 */
class CustomFieldUpdateTest extends BaseTestCase
{
    private $method;

    private $storeRoute;

    private $updateRoute;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'POST';

        $this->storeRoute = 'custom-field/store';

        $this->updateRoute = 'custom-field/update';
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
    public function update()
    {
        $this->markTestSkipped('Custom fields moved to pro; test uses free config and needs refactor.');

        $record = $this->seeder();

        $this->assertIsNotBool($record);
        $this->assertIsArray($record);
        $this->assertArrayHasKey('id', $record);

        $this->call($this->method, $this->updateRoute, [
            'id'       => $record['id'],
            'module'   => 'lead',
            'label'    => 'Custom Field 1 Updated',
            'status'   => true,
            'required' => false
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
    }

    public function seeder()
    {
        $this->call($this->method, $this->storeRoute, [
            'module'     => 'lead',
            'field_key'  => 'custom_field_1',
            'label'      => 'Custom Field 1',
            'type'       => 'text',
            'attributes' => [
                'required' => false
            ],
        ]);

        return $this->getLastRecord('custom_fields');
    }
}
