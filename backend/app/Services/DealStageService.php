<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Model\Setting;
use BitApps\Crm\src\StaticData\DealSystemDefinedStages;

class DealStageService
{
    public const STATUS_ACTIVE = 'active';

    public const STATUS_ARCHIVED = 'archived';

    public const STATUS_ALL = 'all';

    public const STAGES_SETTING_KEY = 'deal_stages';

    public const KEY_IS_ARCHIVED = 'is_archived';

    public function getAllStages(string $status = self::STATUS_ALL)
    {
        $setting = Setting::findOne(['setting_key' => self::STAGES_SETTING_KEY]);

        $stages = $setting ? $setting->setting_value : [];
        $systemDefinedStages = DealSystemDefinedStages::all();

        if (!empty($stages)) {
            $missingSystemDefinedStages = array_diff_key($systemDefinedStages, $stages);

            if (!empty($missingSystemDefinedStages)) {
                $stages = array_merge($stages, $missingSystemDefinedStages);
            }
        } else {
            $stages = $systemDefinedStages;
        }

        switch ($status) {
            case self::STATUS_ALL:
                return $stages;

            case self::STATUS_ARCHIVED:
                return array_filter(
                    $stages,
                    fn ($stage) => !empty($stage[self::KEY_IS_ARCHIVED]) && $stage[self::KEY_IS_ARCHIVED] === true
                );

            case self::STATUS_ACTIVE:
            default:
                return array_filter(
                    $stages,
                    fn ($stage) => empty($stage[self::KEY_IS_ARCHIVED]) || $stage[self::KEY_IS_ARCHIVED] === false
                );
        }
    }

    public function getStagesAsOptions(?string $status = self::STATUS_ALL)
    {
        $stages = $this->getAllStages($status);

        return array_map(
            function ($stage) {
                return [
                    'label' => $stage['name'],
                    'value' => $stage['key']
                ];
            },
            array_values($stages)
        );
    }

    public function upsertStages(array $stages): bool
    {
        if (empty($stages)) {
            return false;
        }

        $settingKey = self::STAGES_SETTING_KEY;

        $setting = Setting::findOne(['setting_key' => $settingKey]);

        if ($setting) {
            return (bool) $setting->update(['setting_value' => $stages, 'updated_by' => get_current_user_id()]);
        }

        return (bool) Setting::insert(['setting_key' => $settingKey, 'setting_value' => $stages, 'created_by' => get_current_user_id()]);
    }

    public function getInitialStageKey(): string
    {
        $stages = $this->getAllStages(self::STATUS_ACTIVE);

        $firstStage = reset($stages);

        return $firstStage['key'] ?? '';
    }
}
