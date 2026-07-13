<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Model\Note;

/**
 * @internal
 *
 * @coversNothing
 */
class NoteIndexTest extends BaseTestCase
{
    private $method;

    private $indexRoute;

    private $storeRoute;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'GET';

        $this->indexRoute = 'notes/index';
        $this->storeRoute = 'notes/store';
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
    public function index()
    {
        $record = $this->seeder();

        $this->assertIsArray($record);

        $this->call($this->method, $this->indexRoute, [
            'page'      => 1,
            'module'    => Lead::MODULE_NAME,
            'entityId'  => 1,
            'perPage'   => 10,
            'sortOrder' => Note::SORT_RECENT_LAST,
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
        $this->assertArrayHasKey('data', $response['data']);
        $this->assertCount(1, $response['data']['data']);
    }

    /**
     * @test
     *
     * @group api
     */
    public function indexWithSearch()
    {
        $record = $this->seeder('Test Note Search');

        $this->assertIsArray($record);

        $this->call($this->method, $this->indexRoute, [
            'page'      => 1,
            'module'    => Lead::MODULE_NAME,
            'entityId'  => 1,
            'perPage'   => 10,
            'sortOrder' => Note::SORT_RECENT_FIRST,
            'search'    => 'Search',
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
        $this->assertArrayHasKey('data', $response['data']);
        $this->assertCount(1, $response['data']['data']);
    }

    public function seeder($title = 'Test Note')
    {
        $this->call('POST', $this->storeRoute, [
            'title'       => $title,
            'details'     => 'Test Note Details',
            'module'      => Lead::MODULE_NAME,
            'entity_id'   => 1,
            'attachments' => [],
        ]);

        return $this->getLastRecord('notes');
    }
}
