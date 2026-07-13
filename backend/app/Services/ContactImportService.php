<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\ImportExportList;
use BitApps\Crm\src\StaticData\CurrencyHelper;

class ContactImportService extends ImportService
{
    public function handleContactInsert(array $contacts, array $fieldMapping, int $fetchLimit): array
    {
        $countDetails = $this->getDefaultCountDetails($fetchLimit);

        if (empty($contacts)) {
            return $countDetails;
        }

        $systemDefinedValues = $this->mapContactsToFields($contacts, $fieldMapping);

        $this->formatLookupFields($systemDefinedValues);

        $insertedContacts = Contact::insert($systemDefinedValues);
        if (!$insertedContacts) {
            return $countDetails;
        }

        $countDetails[ImportExportList::COUNT['COMPLETED']] = \count($systemDefinedValues);
        $countDetails[ImportExportList::COUNT['SKIPPED']] = $fetchLimit - \count($systemDefinedValues);

        $contactIds = $this->extractIds($insertedContacts);

        Hooks::doAction(HookKeys::IMPORT_ENTITIES_CUSTOM_FIELDS, Contact::MODULE_NAME, $contactIds, $contacts, $fieldMapping['customFieldsValues'] ?? []);

        return $countDetails;
    }

    public function handleContactCreateAndUpdate(array $rows, array $fieldMapping, string $emailKey, int $fetchLimit): array
    {
        $countDetails = $this->getDefaultCountDetails();

        if (empty($rows)) {
            return $countDetails;
        }

        [$newContacts, $oldContacts, $storedContacts] = $this->model(Contact::class)->separateEntities($rows, $emailKey, CommonConstant::KEY_ENTITY_EMAIL);

        $this->handleContactInsert($newContacts, $fieldMapping, $fetchLimit);

        $countDetails[ImportExportList::COUNT['COMPLETED']] = \count($newContacts);

        if (empty($oldContacts)) {
            return $countDetails;
        }

        $countDetails[ImportExportList::COUNT['UPDATED']] = \count($oldContacts);

        $systemMap = $fieldMapping['systemDefinedFieldsValues'] ?? [];

        foreach ($oldContacts as $row) {
            $contact = $this->getEntityByColumn(CommonConstant::KEY_ENTITY_EMAIL, $row[$emailKey], $storedContacts);
            if (!$contact) {
                continue;
            }

            $this->updateSystemFields($contact[CommonConstant::KEY_ENTITY_EMAIL], $row, $systemMap);
            Hooks::doAction(HookKeys::UPDATE_IMPORT_CUSTOM_FIELDS, Contact::MODULE_NAME, $contact['id'], $row, $fieldMapping['customFieldsValues'] ?? []);
        }

        return $countDetails;
    }

    public function mapContactsToFields(array &$contacts, array $fieldMapping): array
    {
        $systemMap = $fieldMapping['systemDefinedFieldsValues'] ?? [];
        $homeCurrency = CurrencyHelper::getHomeCurrency();

        $systemDefinedValues = [];

        foreach ($contacts as &$contact) {
            $uuid = Uuid::generate();
            $contact['reference_uuid'] = $uuid;
            $mapped = $this->mapEntityToSystemFields($contact, $systemMap, $uuid);
            $mapped['currency'] = !empty($mapped['currency']) ? $mapped['currency'] : $homeCurrency;
            $systemDefinedValues[] = $mapped;
        }

        unset($contact);

        return $systemDefinedValues;
    }

    private function formatLookupFields(array &$contacts): void
    {
        $this->formatOwnerField($contacts);
        $this->formatParentField($contacts);
        $this->formatCompanyField($contacts);
    }

    private function formatParentField(array &$contacts): void
    {
        $this->model(Contact::class)->processLookupField(
            $contacts,
            'parent_id',
            'parent_name_lookup',
            'last_name'
        );
    }

    private function formatCompanyField(array &$contacts): void
    {
        $this->model(Company::class)->processLookupField(
            $contacts,
            'company_id',
            'company_name_lookup',
            'name'
        );
    }

    private function updateSystemFields(string $email, array $row, array $systemMap): void
    {
        $updatedContact = [];

        foreach ($systemMap as $csvKey => $dbKey) {
            if (isset($row[$csvKey])) {
                $updatedContact[$dbKey] = $row[$csvKey];
            }
        }

        if (!empty($updatedContact)) {
            $updatedContact['updated_by'] = get_current_user_id();
            Contact::where(CommonConstant::KEY_ENTITY_EMAIL, $email)->update($updatedContact);
        }
    }
}
