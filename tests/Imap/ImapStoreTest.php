<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;

/**
 * @internal
 *
 * @coversNothing
 */
class ImapStoreTest extends BaseTestCase
{
    private $method;

    private $route;

    public function setUp() : void
    {
        parent::setUp();

        $this->method = 'POST';

        $this->route = 'imaps/store';
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
            'title'        => 'Imap Test',
            'platform'     => 'other',
            'username'     => 'test@mail.com',
            'app_password' => 'password',
            'host'         => 'imap.test.com',
            'port'         => '993',
            'encryption'   => 'ssl',
            'is_private'   => 'yes',
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertArrayHasKey('status', $response);
        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('data', $response);
    }
}
