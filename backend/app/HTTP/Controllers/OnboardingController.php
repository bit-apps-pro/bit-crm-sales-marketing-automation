<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\Deps\BitApps\WPKit\Utils\Capabilities;
use BitApps\Crm\HTTP\Requests\Onboarding\StoreRequest;
use BitApps\Crm\Services\BusinessSettingService;
use BitApps\Crm\src\Queue\InstallPluginsProcess;
use Throwable;

final class OnboardingController
{
    public const KEY_ONBOARDING_COMPLETED = 'onboarding_completed';

    public function store(StoreRequest $request)
    {
        if (Config::getOption(self::KEY_ONBOARDING_COMPLETED, false)) {
            return Response::error(__('Onboarding has already been completed!', 'bit-crm-sales-marketing-automation'));
        }

        $validated = $request->validated();

        try {
            $businessError = $this->saveBusinessSettings($validated);
            if ($businessError !== null) {
                return $businessError;
            }

            $this->installPlugins($validated['plugins'] ?? []);

            Config::updateOption(self::KEY_ONBOARDING_COMPLETED, true);
        } catch (Throwable $th) {
            return Response::error(null)->message(__('Failed to complete onboarding', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success(null)->message(__('Onboarding completed successfully!', 'bit-crm-sales-marketing-automation'));
    }

    private function saveBusinessSettings(array $validated): ?Response
    {
        $name = $validated['name'] ?? '';
        $email = $validated['email'] ?? '';

        if (empty($name) !== empty($email)) {
            return Response::error(__('Business name and email must both be provided together, or both can be skipped.', 'bit-crm-sales-marketing-automation'));
        }

        if ($name === '' && $email === '') {
            return null;
        }

        $saved = BusinessSettingService::exists()
            ? BusinessSettingService::update(['name' => $name, 'email' => $email])
            : BusinessSettingService::store(['name' => $name, 'email' => $email]);

        if (!$saved) {
            return Response::error(null)->message(__('Failed to save business settings', 'bit-crm-sales-marketing-automation'));
        }

        return null;
    }

    private function installPlugins(array $slugs): void
    {
        if (empty($slugs) || !Capabilities::check('install_plugins')) {
            return;
        }

        $process = new InstallPluginsProcess();

        foreach ($slugs as $slug) {
            $process->push_to_queue($slug);
        }

        $process->save()->dispatch();
    }
}
