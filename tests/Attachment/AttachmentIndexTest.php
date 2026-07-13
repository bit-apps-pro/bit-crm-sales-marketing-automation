<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Model\Lead;

/**
 * @internal
 *
 * @coversNothing
 */
class AttachmentIndexTest extends BaseTestCase
{
    private $method;

    private $indexRoute;

    private $storeRoute;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'GET';

        $this->indexRoute = 'attachments/index';
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
    public function index()
    {
        $record = $this->seeder();

        $this->assertIsArray($record);

        $this->call($this->method, $this->indexRoute, [
            'page'     => 1,
            'module'   => Lead::MODULE_NAME,
            'entityId' => 1,
            'perPage'  => 10,
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
    public function indexWithSearch()
    {
        $record = $this->seeder('test_file_search.pdf');

        $this->assertIsArray($record);

        $this->call($this->method, $this->indexRoute, [
            'page'     => 1,
            'module'   => Lead::MODULE_NAME,
            'entityId' => 1,
            'perPage'  => 10,
            'search'   => 'search',
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
    }

    public function seeder($fileName = 'test_file.pdf')
    {
        $mediaId = wp_rand(1000, 9999);

        $this->call('POST', $this->storeRoute, [
            'module'      => Lead::MODULE_NAME,
            'entity_id'   => 1,
            'attachments' => [
                [
                    'media_id'           => $mediaId,
                    'file_name'          => $fileName,
                    'media_url'          => 'http://example.com/' . $fileName,
                    'mime'               => 'application/pdf',
                    'file_size_in_bytes' => 1024,
                ],
            ],
        ]);

        return $this->getLastRecord('attachments');
    }
}
