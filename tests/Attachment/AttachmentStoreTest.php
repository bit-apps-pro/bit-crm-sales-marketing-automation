<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Model\Attachment;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Lead;

/**
 * @internal
 *
 * @coversNothing
 */
class AttachmentStoreTest extends BaseTestCase
{
    private $method;

    private $route;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'POST';

        $this->route = 'attachments/store';
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
        $mediaId = wp_rand(1000, 9999);

        $this->call($this->method, $this->route, [
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

    /**
     * @test
     *
     * @group api
     */
    public function storeSharedContactAttachment()
    {
        $mediaId = wp_rand(1000, 9999);

        $this->call($this->method, $this->route, [
            'module'      => Contact::MODULE_NAME,
            'entity_id'   => 1,
            'is_shared'   => true,
            'attachments' => [
                [
                    'media_id'           => $mediaId,
                    'file_name'          => 'shared_attachment.pdf',
                    'media_url'          => 'http://example.com/shared_attachment.pdf',
                    'mime'               => 'application/pdf',
                    'file_size_in_bytes' => 1024,
                ],
            ],
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertEquals('success', $response['status']);

        $attachment = Attachment::findOne(['media_id' => (string) $mediaId]);

        $this->assertTrue((bool) ($attachment->attributes['is_shared'] ?? false));
    }

    /**
     * @test
     *
     * @group api
     */
    public function rejectStoringSharedNonContactAttachment()
    {
        $this->call($this->method, $this->route, [
            'module'      => Lead::MODULE_NAME,
            'entity_id'   => 1,
            'is_shared'   => true,
            'attachments' => [
                [
                    'media_id'           => wp_rand(1000, 9999),
                    'file_name'          => 'shared_attachment.pdf',
                    'media_url'          => 'http://example.com/shared_attachment.pdf',
                    'mime'               => 'application/pdf',
                    'file_size_in_bytes' => 1024,
                ],
            ],
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('error', $response['status']);
        $this->assertEquals('Only contact attachments can be shared with clients.', $response['data']);
    }
}
