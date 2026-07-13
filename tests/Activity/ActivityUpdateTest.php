<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Model\Lead;

/**
 * @internal
 *
 * @coversNothing
 */
class ActivityUpdateTest extends BaseTestCase
{
    private $method;

    private $updateRoute;

    private $storeRoute;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'POST';

        $this->updateRoute = 'activities/update';
        $this->storeRoute = 'activities/store';
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
        $record = $this->seeder();

        $this->assertIsNotBool($record);
        $this->assertIsArray($record);
        $this->assertArrayHasKey('id', $record);

        $updatedTitle = 'Test Activity Update';

        $this->call($this->method, $this->updateRoute, [
            'id'          => $record['id'],
            'title'       => $updatedTitle,
            'type'        => 'task',
            'priority'    => 'high',
            'due_date'    => '2026-10-01',
            'details'     => 'Test Activity Details',
            'entity_id'   => '1',
            'module'      => Lead::MODULE_NAME,
            'assigned_to' => get_current_user_id(),
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
        $this->assertArrayHasKey('id', $response['data']);
        $this->assertArrayHasKey('title', $response['data']);
        $this->assertEquals($updatedTitle, $response['data']['title']);
    }

    public function seeder()
    {
        $this->call($this->method, $this->storeRoute, [
            'title'       => 'Test Activity',
            'type'        => 'task',
            'priority'    => 'medium',
            'due_date'    => '2026-10-01',
            'details'     => 'Test Activity Details',
            'entity_id'   => '1',
            'module'      => Lead::MODULE_NAME,
            'assigned_to' => get_current_user_id(),
        ]);

        return $this->getLastRecord('activities');
    }
}
