<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\BusinessSettings\ShowRequest;
use BitApps\Crm\HTTP\Requests\BusinessSettings\StoreRequest;
use BitApps\Crm\HTTP\Requests\BusinessSettings\UpdateRequest;
use BitApps\Crm\Services\BusinessSettingService;

final class BusinessSettingsController
{
    public function store(StoreRequest $request)
    {
        $validated = $request->validated();

        if (BusinessSettingService::exists()) {
            return Response::error(__('Business Settings already exists!', 'bit-crm-sales-marketing-automation'));
        }

        if (BusinessSettingService::store($validated)) {
            return Response::success(__('Business Settings inserted successfully!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::error(__('Business Settings insertion failed!', 'bit-crm-sales-marketing-automation'));
    }

    public function update(UpdateRequest $request)
    {
        $validated = $request->validated();

        $setting = BusinessSettingService::update($validated);

        if (!$setting) {
            return Response::error(__('Business Settings update failed!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success(__('Business Settings updated successfully!', 'bit-crm-sales-marketing-automation'));
    }

    public function show(ShowRequest $request)
    {
        $settingValue = BusinessSettingService::getSettings();

        if ($settingValue === null) {
            return Response::error(__('Business settings not found!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success($settingValue);
    }
}
