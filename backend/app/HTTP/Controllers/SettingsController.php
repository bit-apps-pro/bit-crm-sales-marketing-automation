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
                // Merge every provided field into the existing value so a multi-field
                // payload is persisted atomically in a single update (callers no longer
                // need to send one request per field).
                foreach ($validated['setting_value'] as $fieldKey => $fieldValue) {
                    if (\is_array($fieldValue)) {
                        $settingValue[$fieldKey] = array_merge($settingValue[$fieldKey] ?? [], $fieldValue);
                    } else {
                        $settingValue[$fieldKey] = $fieldValue;
                    }
                }

                $updatedValue = $settingValue;
            } else {
                $updatedValue = $validated['setting_value'];
            }

            try {
                $setting->update(['setting_value' => $updatedValue, 'updated_by' => get_current_user_id()]);
            } catch (Throwable $th) {
                return Response::error(__('Failed to update settings!', 'bit-crm-sales-marketing-automation'));
            }

            return Response::success(__('Settings update successfully.', 'bit-crm-sales-marketing-automation'));
        }

        $validated['created_by'] = get_current_user_id();

        if (Setting::insert($validated)) {
            return Response::success(__('New settings inserted.', 'bit-crm-sales-marketing-automation'));
        }

        return Response::error(__('Settings upsert failed!', 'bit-crm-sales-marketing-automation'));
    }
}
