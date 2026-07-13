<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;

/**
 * @internal
 *
 * @coversNothing
 */
class CustomFieldDeleteTest extends BaseTestCase
{
    private $method;

    private $storeRoute;

    private $deleteRoute;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'POST';

        $this->storeRoute = 'custom-field/store';

        $this->deleteRoute = 'custom-field/delete';
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
    public function delete()
    {
        $this->markTestSkipped('Custom fields moved to pro; test uses free config and needs refactor.');

        $record = $this->seeder();

        $this->assertIsNotBool($record);
        $this->assertIsArray($record);
        $this->assertArrayHasKey('id', $record);

        // TODO: Implement the delete test after changing the delete method logic (as new database implementation) in the controller

        // $this->call($this->method, $this->deleteRoute, ['fieldId' => $record['id']]);

        // $response = JSON::maybeDecode($this->_last_response, true);

        // $this->assertArrayHasKey('status', $response);
        // $this->assertEquals('success', $response['status']);
        // $this->assertArrayHasKey('data', $response);
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
