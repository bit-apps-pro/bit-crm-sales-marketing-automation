<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Model\Lead;

/**
 * @internal
 *
 * @coversNothing
 */
class NoteUpdateTest extends BaseTestCase
{
    private $method;

    private $updateRoute;

    private $storeRoute;

    public function setUp(): void
    {
        parent::setUp();

        $this->method = 'POST';

        $this->updateRoute = 'notes/update';
        $this->storeRoute = 'notes/store';
    }

    public function tearDown(): void
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

        $updatedTitle = 'Test Note Update';

        $this->call($this->method, $this->updateRoute, [
            'id'          => $record['id'],
            'title'       => $updatedTitle,
            'details'     => 'Test Note Details Update',
            'is_shared'   => false,
            'attachments' => [],
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
        $this->assertArrayHasKey('id', $response['data']);
        $this->assertArrayHasKey('title', $response['data']);
        $this->assertEquals($updatedTitle, $response['data']['title']);
    }

    /**
     * @test
     *
     * @group api
     */
    public function updateWithAttachments()
    {
        $record = $this->seeder();

        $this->assertIsNotBool($record);
        $this->assertIsArray($record);
        $this->assertArrayHasKey('id', $record);

        $mediaId = wp_rand(1000, 9999);
        $updatedTitle = 'Test Note Update with Attachments';

        $this->call($this->method, $this->updateRoute, [
            'id'          => $record['id'],
            'title'       => $updatedTitle,
            'details'     => 'Test Note Details Update with Attachments',
            'is_shared'   => false,
            'attachments' => [
                [
                    'media_id'           => $mediaId,
                    'file_name'          => 'test_attachment.pdf',
                    'media_url'          => 'http://example.com/test_attachment.pdf',
                    'mime'               => 'application/pdf',
                    'file_size_in_bytes' => 1024,
                ],
            ],
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
            'title'       => 'Test Note',
            'details'     => 'Test Note Details',
            'module'      => Lead::MODULE_NAME,
            'is_shared'   => false,
            'entity_id'   => 1,
            'attachments' => [],
        ]);

        return $this->getLastRecord('notes');
    }
}
