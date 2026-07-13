<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\HTTP\Controllers\OnboardingController;
use BitApps\Crm\Services\BusinessSettingService;

/**
 * @internal
 *
 * @coversNothing
 */
class OnboardingStoreTest extends BaseTestCase
{
    private $method;

    private $route;

    public function setUp(): void
    {
        parent::setUp();

        $this->method = 'POST';
        $this->route = 'onboarding/store';

        // The controller short-circuits when onboarding is already completed,
        // so start every case from a clean slate.
        Config::deleteOption(OnboardingController::KEY_ONBOARDING_COMPLETED);
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
    public function completesOnboardingAndPersistsBusinessSettings()
    {
        $this->call($this->method, $this->route, [
            'name'  => 'Acme Inc',
            'email' => 'owner@acme.test',
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertEquals('success', $response['status']);
        $this->assertTrue((bool) Config::getOption(OnboardingController::KEY_ONBOARDING_COMPLETED, false));

        $settings = BusinessSettingService::getSettings();
        $this->assertIsArray($settings);
        $this->assertEquals('Acme Inc', $settings['name']);
        $this->assertEquals('owner@acme.test', $settings['email']);
    }

    /**
     * @test
     *
     * @group api
     */
    public function allowsSkippingBusinessSettings()
    {
        $this->call($this->method, $this->route, []);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertEquals('success', $response['status']);
        $this->assertTrue((bool) Config::getOption(OnboardingController::KEY_ONBOARDING_COMPLETED, false));
        $this->assertNull(BusinessSettingService::getSettings());
    }

    /**
     * @test
     *
     * @group api
     */
    public function rejectsNameWithoutEmailAndDoesNotComplete()
    {
        $this->call($this->method, $this->route, [
            'name' => 'Acme Inc',
        ]);

        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertEquals('error', $response['status']);
        $this->assertFalse((bool) Config::getOption(OnboardingController::KEY_ONBOARDING_COMPLETED, false));
        $this->assertNull(BusinessSettingService::getSettings());
    }
}
