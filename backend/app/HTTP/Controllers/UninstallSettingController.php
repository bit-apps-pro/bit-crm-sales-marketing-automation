<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\UninstallSetting\ShowRequest;
use BitApps\Crm\HTTP\Requests\UninstallSetting\UpdateRequest;
use BitApps\Crm\Services\UninstallSettingService;

final class UninstallSettingController
{
    private $uninstallSettingService;

    public function __construct()
    {
        $this->uninstallSettingService = new UninstallSettingService();
    }

    public function show(ShowRequest $request)
    {
        return Response::success($this->uninstallSettingService->settings());
    }

    public function update(UpdateRequest $request)
    {
        $validated = $request->validated();

        $this->uninstallSettingService->updateEraseEnabled((bool) $validated['erase_on_uninstall']);

        return Response::success($this->uninstallSettingService->settings())
            ->message(__('Settings updated successfully.', 'bit-crm-sales-marketing-automation'));
    }
}
