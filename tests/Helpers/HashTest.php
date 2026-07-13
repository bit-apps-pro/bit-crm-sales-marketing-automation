<?php

use BitApps\Crm\Helpers\Hash;

/**
 * @internal
 *
 * @coversNothing
 */
class HashTest extends BaseTestCase
{
    public function setUp() : void
    {
        parent::setUp();
    }

    public function tearDown() : void
    {
        parent::tearDown();
    }

    /**
     * @group api
     */
    public function testEncrypt()
    {
        $data = 'Hello World !';
        $encrypted = Hash::encrypt($data);
        $this->assertEquals($data, Hash::decrypt($encrypted));
    }
}
