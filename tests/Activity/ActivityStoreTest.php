<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Model\Lead;

/**
 * @internal
 *
 * @coversNothing
 */
class ActivityStoreTest extends BaseTestCase
{
    private $method;

    private $route;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'POST';

        $this->route = 'activities/store';
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
            'title'       => 'Test Activity',
            'type'        => 'task',
            'priority'    => 'high',
            'due_date'    => '2026-10-01',
            'details'     => 'Test Activity Details',
            'entity_id'   => 1,
            'module'      => Lead::MODULE_NAME,
            'assigned_to' => get_current_user_id(),
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
    }
}
