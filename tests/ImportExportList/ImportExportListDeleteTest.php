<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Model\ImportExportList;
use BitApps\Crm\Model\Lead;

/**
 * @internal
 *
 * @coversNothing
 */
class ImportExportListDeleteTest extends BaseTestCase
{
    private $method;

    private $deleteRoute;

    private $storeRoute;

    public function setUp(): void
    {
        parent::setUp();

        $this->method = 'POST';

        $this->deleteRoute = 'import-export-list/delete';
        $this->storeRoute = 'leads/import';
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
    public function delete()
    {
        $record = $this->seeder();

        $this->assertNotNull($record, 'Seeder should create a record');
        $this->assertArrayHasKey('id', $record, 'Record should have an ID');

        $this->call($this->method, $this->deleteRoute, [
            'id' => $record['id'],
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
        $this->assertEquals('Record deleted successfully', $response['data']);
    }

    /**
     * @test
     *
     * @group api
     */
    public function deleteNonExistingImportExportList()
    {
        $this->call($this->method, $this->deleteRoute, [
            'id' => 99999, // Non-existing ID
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('error', $response['status']);
        $this->assertArrayHasKey('data', $response);
        $this->assertEquals('Record not found!', $response['data']);
    }

    public function seeder()
    {
        // Directly insert an ImportExportList record
        $record = ImportExportList::insert([
            'type'       => ImportExportList::IMPORT,
            'process_id' => 'test_import_' . time(),
            'module'     => Lead::MODULE_NAME,
            'total'      => 100,
            'completed'  => 50,
            'updated'    => 10,
            'skipped'    => 40,
            'file_name'  => 'test-import.csv',
            'file_path'  => '/uploads/bit-crm/imports/test-import.csv',
            'status'     => 'completed',
        ]);

        return $record ? $record->getAttributes() : null;
    }
}
