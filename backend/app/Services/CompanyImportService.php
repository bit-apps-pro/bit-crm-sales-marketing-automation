<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\ImportExportList;
use BitApps\Crm\src\StaticData\CurrencyHelper;

class CompanyImportService extends ImportService
{
    public function handleCompanyInsert(array $companies, array $fieldMapping, int $fetchLimit): array
    {
        $countDetails = $this->getDefaultCountDetails($fetchLimit);

        if (empty($companies)) {
            return $countDetails;
        }

        $systemDefinedValues = $this->mapCompaniesToFields($companies, $fieldMapping);

        $this->formatLookupFields($systemDefinedValues);

        $insertedCompanies = Company::insert($systemDefinedValues);
        if (!$insertedCompanies) {
            return $countDetails;
        }

        $countDetails[ImportExportList::COUNT['COMPLETED']] = \count($systemDefinedValues);
        $countDetails[ImportExportList::COUNT['SKIPPED']] = $fetchLimit - \count($systemDefinedValues);

        $companyIds = $this->extractIds($insertedCompanies);

        Hooks::doAction(HookKeys::IMPORT_ENTITIES_CUSTOM_FIELDS, Company::MODULE_NAME, $companyIds, $companies, $fieldMapping['customFieldsValues'] ?? []);

        return $countDetails;
    }

    public function handleCompanyCreateAndUpdate(array $rows, array $fieldMapping, string $nameKey, int $fetchLimit): array
    {
        $countDetails = $this->getDefaultCountDetails();

        if (empty($rows)) {
            return $countDetails;
        }

        [$newCompanies, $oldCompanies, $storedCompanies] = $this->model(Company::class)->separateEntities($rows, $nameKey, 'name');

        $this->handleCompanyInsert($newCompanies, $fieldMapping, $fetchLimit);

        $countDetails[ImportExportList::COUNT['COMPLETED']] = \count($newCompanies);

        if (empty($oldCompanies)) {
            return $countDetails;
        }

        $countDetails[ImportExportList::COUNT['UPDATED']] = \count($oldCompanies);

        $systemMap = $fieldMapping['systemDefinedFieldsValues'] ?? [];

        foreach ($oldCompanies as $row) {
            $company = $this->getEntityByColumn('name', $row[$nameKey], $storedCompanies);
            if (!$company) {
                continue;
            }

            $this->updateSystemFields($company['name'], $row, $systemMap);
            Hooks::doAction(HookKeys::UPDATE_IMPORT_CUSTOM_FIELDS, Company::MODULE_NAME, $company['id'], $row, $fieldMapping['customFieldsValues'] ?? []);
        }

        return $countDetails;
    }

    public function mapCompaniesToFields(array &$companies, array $fieldMapping): array
    {
        $systemMap = $fieldMapping['systemDefinedFieldsValues'] ?? [];
        $homeCurrency = CurrencyHelper::getHomeCurrency();

        $systemDefinedValues = [];

        foreach ($companies as &$company) {
            $uuid = Uuid::generate();
            $company['reference_uuid'] = $uuid;
            $mapped = $this->mapEntityToSystemFields($company, $systemMap, $uuid);
            $mapped['currency'] = !empty($mapped['currency']) ? $mapped['currency'] : $homeCurrency;
            $systemDefinedValues[] = $mapped;
        }

        unset($company);

        return $systemDefinedValues;
    }

    private function formatLookupFields(array &$companies): void
    {
        $this->formatOwnerField($companies);
        $this->formatParentField($companies);
    }

    private function formatParentField(array &$companies): void
    {
        $this->model(Company::class)->processLookupField(
            $companies,
            'parent_id',
            'parent_name_lookup',
            'name'
        );
    }

    private function updateSystemFields(string $name, array $row, array $systemMap): void
    {
        $updatedCompany = [];

        foreach ($systemMap as $csvKey => $dbKey) {
            if (isset($row[$csvKey])) {
                $updatedCompany[$dbKey] = $row[$csvKey];
            }
        }

        if (!empty($updatedCompany)) {
            $updatedCompany['updated_by'] = get_current_user_id();
            Company::where('name', $name)->update($updatedCompany);
        }
    }
}
