<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\ImportExportList;
use BitApps\Crm\src\StaticData\CurrencyHelper;

class DealImportService extends ImportService
{
    private DealService $dealService;

    public function __construct()
    {
        $this->dealService = new DealService();
    }

    public function handleDealInsert(array $deals, array $fieldMapping, int $fetchLimit): array
    {
        $countDetails = $this->getDefaultCountDetails($fetchLimit);

        if (empty($deals)) {
            return $countDetails;
        }

        $systemDefinedValues = $this->mapDealsToFields($deals, $fieldMapping);

        $this->formatLookupFields($systemDefinedValues);

        $insertedDeals = Deal::insert($systemDefinedValues);
        if (empty($insertedDeals)) {
            return $countDetails;
        }

        $countDetails[ImportExportList::COUNT['COMPLETED']] = \count($systemDefinedValues);
        $countDetails[ImportExportList::COUNT['SKIPPED']] = $fetchLimit - \count($systemDefinedValues);

        $dealIds = $this->extractIds($insertedDeals);

        Hooks::doAction(HookKeys::IMPORT_ENTITIES_CUSTOM_FIELDS, Deal::MODULE_NAME, $dealIds, $deals, $fieldMapping['customFieldsValues'] ?? []);

        return $countDetails;
    }

    public function handleDealCreateAndUpdate(array $rows, array $fieldMapping, string $nameKey, int $fetchLimit): array
    {
        $countDetails = $this->getDefaultCountDetails();

        if (empty($rows)) {
            return $countDetails;
        }

        [$newDeals, $oldDeals, $storedDeals] = $this->model(Deal::class)->separateEntities($rows, $nameKey, 'name');

        $this->handleDealInsert($newDeals, $fieldMapping, $fetchLimit);

        $countDetails[ImportExportList::COUNT['COMPLETED']] = \count($newDeals);

        if (empty($oldDeals)) {
            return $countDetails;
        }

        $countDetails[ImportExportList::COUNT['UPDATED']] = \count($oldDeals);

        $systemMap = $fieldMapping['systemDefinedFieldsValues'] ?? [];
        $stages = (new DealStageService())->getAllStages();

        foreach ($oldDeals as $row) {
            $deal = $this->getEntityByColumn('name', $row[$nameKey], $storedDeals);
            if (!$deal) {
                continue;
            }

            $this->updateSystemFields($deal['name'], $row, $systemMap, $stages);
            Hooks::doAction(HookKeys::UPDATE_IMPORT_CUSTOM_FIELDS, Deal::MODULE_NAME, $deal['id'], $row, $fieldMapping['customFieldsValues'] ?? []);
        }

        return $countDetails;
    }

    public function mapDealsToFields(array &$deals, array $fieldMapping): array
    {
        $stages = (new DealStageService())->getAllStages();
        $homeCurrency = CurrencyHelper::getHomeCurrency();
        $systemMap = $fieldMapping['systemDefinedFieldsValues'] ?? [];
        $stageKey = array_search('stage', $systemMap);
        $probabilityKey = array_search('probability', $systemMap);
        $firstStage = array_key_first($stages);

        $systemDefinedValues = [];

        foreach ($deals as &$deal) {
            $resolvedStage = ($stageKey !== false && isset($stages[$deal[$stageKey] ?? '']))
                ? $deal[$stageKey]
                : $firstStage;

            $uuid = Uuid::generate();
            $deal['reference_uuid'] = $uuid;
            $mappedDeal = $this->mapEntityToSystemFields($deal, $systemMap, $uuid);

            $mappedDeal['stage'] = $resolvedStage;
            $stageProbability = $stages[$resolvedStage]['probability'] ?? null;
            $csvProbability = $probabilityKey !== false && isset($deal[$probabilityKey]) ? $deal[$probabilityKey] : null;
            $mappedDeal['probability'] = $this->getValidProbability($csvProbability, $stageProbability);
            $mappedDeal['currency'] = !empty($mappedDeal['currency']) ? $mappedDeal['currency'] : $homeCurrency;
            $systemDefinedValues[] = $this->dealService->convertCurrencies($mappedDeal);
        }

        unset($deal);

        return $systemDefinedValues;
    }

    private function formatLookupFields(array &$deals): void
    {
        $this->formatOwnerField($deals);
        $this->formatCompanyField($deals);
        $this->formatContactField($deals);
    }

    private function formatContactField(array &$deals): void
    {
        $this->model(Contact::class)->processLookupField(
            $deals,
            'contact_id',
            'contact_name_lookup',
            'last_name'
        );
    }

    private function formatCompanyField(array &$deals): void
    {
        $this->model(Company::class)->processLookupField(
            $deals,
            'company_id',
            'company_name_lookup',
            'name'
        );
    }

    private function updateSystemFields(string $name, array $row, array $systemMap, array $stages): void
    {
        $updatedDeal = [];

        foreach ($systemMap as $csvKey => $dbKey) {
            if (!isset($row[$csvKey])) {
                continue;
            }

            $value = $row[$csvKey];
            if ($dbKey === 'stage' && !isset($stages[$value])) {
                continue;
            }

            $updatedDeal[$dbKey] = $value;
        }

        if (isset($updatedDeal['stage'])) {
            $stageProbability = $stages[$updatedDeal['stage']]['probability'] ?? null;
            if ($stageProbability !== null) {
                $updatedDeal['probability'] = $stageProbability;
            }
        }

        if (!empty($updatedDeal)) {
            $updatedDeal['updated_by'] = get_current_user_id();
            $updatedDeal = $this->dealService->convertCurrencies($updatedDeal);
            Deal::where('name', $name)->update($updatedDeal);
        }
    }

    private function getValidProbability($csvProbability, ?float $fallbackProbability): ?float
    {
        if ($csvProbability !== null && is_numeric($csvProbability) && $csvProbability >= 0 && $csvProbability <= 100) {
            return (float) $csvProbability;
        }

        return $fallbackProbability;
    }
}
