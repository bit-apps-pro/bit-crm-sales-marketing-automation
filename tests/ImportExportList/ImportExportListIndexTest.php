<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Model\Lead;

/**
 * @internal
 *
 * @coversNothing
 */
class ImportExportListIndexTest extends BaseTestCase
{
    private $method;

    private $indexRoute;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'GET';

        $this->indexRoute = 'import-export-list/index';
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
        $this->call($this->method, $this->indexRoute, [
            'module'    => Lead::MODULE_NAME,
            'type'      => 'import',
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
    }
}
