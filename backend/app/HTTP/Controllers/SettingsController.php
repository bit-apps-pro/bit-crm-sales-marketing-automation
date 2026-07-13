<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\Arr;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\Model\Setting;
use Throwable;

final class SettingsController
{
    public function upsert(Request $request)
    {
        $validated = $request->validate(
            [
                'setting_key'   => ['required', 'string', 'sanitize:text'],
                'setting_value' => ['required', 'array']
            ]
        );

        $setting = Setting::findOne(['setting_key' => $validated['setting_key']]);

        if ($setting) {
            $settingValue = $setting->setting_value;

            if (Arr::isAssoc($settingValue)) {
                $fieldKey = key($validated['setting_value']);

                if (!\is_array($validated['setting_value'][$fieldKey])) {
                    $settingValue[$fieldKey] = $validated['setting_value'][$fieldKey];
                } else {
                    $settingValue[$fieldKey] = array_merge($settingValue[$fieldKey] ?? [], $validated['setting_value'][$fieldKey]);
                }

                $updatedValue = $settingValue;
            } else {
                $updatedValue = $validated['setting_value'];
            }

            try {
                $setting->update(['setting_value' => $updatedValue, 'updated_by' => get_current_user_id()]);
            } catch (Throwable $th) {
                return Response::error(__('Failed to update settings!', 'bit-crm'));
            }

            return Response::success(__('Settings update successfully.', 'bit-crm'));
        }

        $validated['created_by'] = get_current_user_id();

        if (Setting::insert($validated)) {
            return Response::success(__('New settings inserted.', 'bit-crm'));
        }

        return Response::error(__('Settings upsert failed!', 'bit-crm'));
    }
}
