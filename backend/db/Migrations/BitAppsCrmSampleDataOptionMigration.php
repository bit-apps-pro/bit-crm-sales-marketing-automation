<?php

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Migration\Migration;
use BitApps\Crm\HTTP\Controllers\OnboardingController;
use BitApps\Crm\Services\SampleDataService;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Installs that finished onboarding before the sample data offer existed must
 * never see it, so record the offer as dismissed for them. Fresh installs have
 * no onboarding marker yet and keep the pending default.
 */
final class BitAppsCrmSampleDataOptionMigration extends Migration
{
    public function up(): void
    {
        $sampleData = new SampleDataService();

        if ($sampleData->isPending() && Config::getOption(OnboardingController::KEY_ONBOARDING_COMPLETED)) {
            $sampleData->dismiss();
        }
    }

    public function down(): void
    {
        Config::deleteOption(SampleDataService::OPTION);
    }
}
