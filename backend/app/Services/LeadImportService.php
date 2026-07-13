<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\Model\ImportExportList;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\src\StaticData\CurrencyHelper;

class LeadImportService extends ImportService
{
    public function handleLeadInsert(array $leads, array $fieldMapping, int $fetchLimit): array
    {
        $countDetails = $this->getDefaultCountDetails($fetchLimit);

        if (empty($leads)) {
            return $countDetails;
        }

        $systemDefinedValues = $this->mapLeadsToFields($leads, $fieldMapping);

        $this->formatLookupFields($systemDefinedValues);

        $insertedLeads = Lead::insert($systemDefinedValues);
        if (!$insertedLeads) {
            return $countDetails;
        }

        $countDetails[ImportExportList::COUNT['COMPLETED']] = \count($systemDefinedValues);
        $countDetails[ImportExportList::COUNT['SKIPPED']] = $fetchLimit - \count($systemDefinedValues);

        $leadIds = $this->extractIds($insertedLeads);

        Hooks::doAction(HookKeys::IMPORT_ENTITIES_CUSTOM_FIELDS, Lead::MODULE_NAME, $leadIds, $leads, $fieldMapping['customFieldsValues'] ?? []);

        return $countDetails;
    }

    public function handleLeadCreateAndUpdate(array $rows, array $fieldMapping, string $emailKey, int $fetchLimit): array
    {
        $countDetails = $this->getDefaultCountDetails();

        if (empty($rows)) {
            return $countDetails;
        }

        [$newLeads, $oldLeads, $storedLeads] = $this->model(Lead::class)->separateEntities($rows, $emailKey, 'email');

        $this->handleLeadInsert($newLeads, $fieldMapping, $fetchLimit);

        $countDetails[ImportExportList::COUNT['COMPLETED']] = \count($newLeads);

        if (empty($oldLeads)) {
            return $countDetails;
        }

        $countDetails[ImportExportList::COUNT['UPDATED']] = \count($oldLeads);

        $systemMap = $fieldMapping['systemDefinedFieldsValues'] ?? [];

        foreach ($oldLeads as $row) {
            $lead = $this->getEntityByColumn('email', $row[$emailKey], $storedLeads);
            if (!$lead) {
                continue;
            }

            $this->updateSystemFields($lead['email'], $row, $systemMap);
            Hooks::doAction(HookKeys::UPDATE_IMPORT_CUSTOM_FIELDS, Lead::MODULE_NAME, $lead['id'], $row, $fieldMapping['customFieldsValues'] ?? []);
        }

        return $countDetails;
    }

    public function mapLeadsToFields(array &$leads, array $fieldMapping): array
    {
        $systemMap = $fieldMapping['systemDefinedFieldsValues'] ?? [];
        $homeCurrency = CurrencyHelper::getHomeCurrency();

        $systemDefinedValues = [];

        foreach ($leads as &$lead) {
            $uuid = Uuid::generate();
            $lead['reference_uuid'] = $uuid;
            $mapped = $this->mapEntityToSystemFields($lead, $systemMap, $uuid);
            $mapped['currency'] = !empty($mapped['currency']) ? $mapped['currency'] : $homeCurrency;
            $systemDefinedValues[] = $mapped;
        }

        unset($lead);

        return $systemDefinedValues;
    }

    private function formatLookupFields(array &$leads): void
    {
        $this->formatOwnerField($leads);
    }

    private function updateSystemFields(string $email, array $row, array $systemMap): void
    {
        $updatedLead = [];

        foreach ($systemMap as $csvKey => $dbKey) {
            if (isset($row[$csvKey])) {
                $updatedLead[$dbKey] = $row[$csvKey];
            }
        }

        if (!empty($updatedLead)) {
            $updatedLead['updated_by'] = get_current_user_id();
            Lead::where('email', $email)->update($updatedLead);
        }
    }
}
