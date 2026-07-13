<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;

/**
 * @internal
 *
 * @coversNothing
 */
class ImapDeleteTest extends BaseTestCase
{
    private $method;

    private $deleteRoute;

    private $storeRoute;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'POST';

        $this->deleteRoute = 'imaps/delete';
        $this->storeRoute = 'imaps/store';
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

        // TODO: Implement the delete test after changing the delete method logic (as new database implementation) in the controller

        // $this->call($this->method, $this->deleteRoute, ['id' => $record['id']]);

        // $response = JSON::maybeDecode($this->_last_response, true);

        // $this->assertArrayHasKey('status', $response);
        // $this->assertEquals('success', $response['status']);
        // $this->assertArrayHasKey('data', $response);
    }

    public function seeder()
    {
        $this->call($this->method, $this->storeRoute, [
            'title'        => 'Imap Test',
            'platform'     => 'other',
            'username'     => 'test@mail.com',
            'app_password' => 'password',
            'host'         => 'imap.test.com',
            'port'         => '993',
            'encryption'   => 'ssl',
            'is_private'   => 'yes'
        ]);

        return $this->getLastRecord('imap_settings');
    }
}
