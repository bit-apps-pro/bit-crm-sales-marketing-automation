<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Model\Lead;

/**
 * @internal
 *
 * @coversNothing
 */
class AttachmentDeleteTest extends BaseTestCase
{
    private $method;

    private $deleteRoute;

    private $storeRoute;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'POST';

        $this->deleteRoute = 'attachments/delete';
        $this->storeRoute = 'attachments/store';
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
        $this->assertEquals('Attachment deleted successfully!', $response['data']);
    }

    /**
     * @test
     *
     * @group api
     */
    public function deleteNonExistingAttachment()
    {
        $this->call($this->method, $this->deleteRoute, [
            'id' => 99999, // Non-existing ID
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('error', $response['status']);
        $this->assertArrayHasKey('data', $response);
        $this->assertEquals('Attachment not found!', $response['data']);
    }

    public function seeder()
    {
        $mediaId = wp_rand(1000, 9999);

        $this->call('POST', $this->storeRoute, [
            'module'      => Lead::MODULE_NAME,
            'entity_id'   => 1,
            'attachments' => [
                [
                    'media_id'           => $mediaId,
                    'file_name'          => 'test_file.pdf',
                    'media_url'          => 'http://example.com/test_file.pdf',
                    'mime'               => 'application/pdf',
                    'file_size_in_bytes' => 1024,
                ],
            ],
        ]);

        return $this->getLastRecord('attachments');
    }
}
