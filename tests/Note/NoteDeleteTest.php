<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Model\Lead;

/**
 * @internal
 *
 * @coversNothing
 */
class NoteDeleteTest extends BaseTestCase
{
    private $method;

    private $deleteRoute;

    private $storeRoute;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'POST';

        $this->deleteRoute = 'notes/delete';
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
    public function delete()
    {
        $record = $this->seeder();

        $this->assertIsNotBool($record);
        $this->assertIsArray($record);
        $this->assertArrayHasKey('id', $record);

        $this->call($this->method, $this->deleteRoute, [
            'id' => $record['id'],
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
        $this->assertEquals('Note deleted successfully!', $response['data']);
    }

    /**
     * @test
     *
     * @group api
     */
    public function deleteNonExistingNote()
    {
        $this->call($this->method, $this->deleteRoute, [
            'id' => 99999, // Non-existing ID
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('error', $response['status']);
        $this->assertArrayHasKey('data', $response);
        $this->assertEquals('Note not found!', $response['data']);
    }

    public function seeder()
    {
        $this->call($this->method, $this->storeRoute, [
            'title'       => 'Test Note',
            'details'     => 'Test Note Details',
            'module'      => Lead::MODULE_NAME,
            'entity_id'   => 1,
            'attachments' => [],
        ]);

        return $this->getLastRecord('notes');
    }
}
