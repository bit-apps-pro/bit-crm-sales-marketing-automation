<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Model\Lead;

/**
 * @internal
 *
 * @coversNothing
 */
class NoteStoreTest extends BaseTestCase
{
    private $method;

    private $route;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'POST';

        $this->route = 'notes/store';
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
            'title'       => 'Test Note',
            'details'     => 'Test Note Details',
            'module'      => Lead::MODULE_NAME,
            'entity_id'   => 1,
            'attachments' => [],
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
    }

    /**
     * @test
     *
     * @group api
     */
    public function storeWithAttachments()
    {
        $mediaId = wp_rand(1000, 9999);

        $this->call($this->method, $this->route, [
            'title'       => 'Test Note with Attachments',
            'details'     => 'Test Note Details with Attachments',
            'module'      => Lead::MODULE_NAME,
            'entity_id'   => 1,
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
    }
}
