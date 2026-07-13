<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Lead;
use stdClass;

class ConvertService
{
    /**
     * Get field mappings for lead to contact/company conversion.
     *
     * Retrieves mappings from settings or generates defaults if not configured.
     *
     * @return array mapping configuration for contacts and companies
     */
    public static function getConversionMapping()
    {
        $conversionMapping = SettingService::getSettingsValue(Lead::SETTINGS_KEYS['CONVERSION_MAPPING'])['mappings'] ?? [];
        $leadFields = (new LeadService())->fields();
        $contactFields = (new ContactService())->fields();
        $companyFields = (new CompanyService())->fields();
        $dealFields = (new DealService())->fields();

        if (empty($conversionMapping) || empty($conversionMapping[Contact::MODULE_NAME])) {
            $conversionMapping[Contact::MODULE_NAME] = self::defaultConversionMapping(
                $leadFields,
                $contactFields,
                [
                    'last_name' => 'last_name',
                ],
            );
        }

        if (empty($conversionMapping) || empty($conversionMapping[Company::MODULE_NAME])) {
            $conversionMapping[Company::MODULE_NAME] = self::defaultConversionMapping(
                $leadFields,
                $companyFields,
                ['company_name' => 'name']
            );
        }

        if (empty($conversionMapping) || empty($conversionMapping[Deal::MODULE_NAME])) {
            $conversionMapping[Deal::MODULE_NAME] = self::defaultConversionMapping(
                $leadFields,
                $dealFields,
                ['last_name' => 'name']
            );
        }

        return $conversionMapping;
    }

    public static function defaultConversionMapping(array $sourceFields, array $targetFields, ?array $default = []): array
    {
        $sourceKeys = self::extractFieldKeys($sourceFields);
        $targetKeys = self::extractFieldKeys($targetFields);
        $mapping = [];

        foreach ($sourceKeys as $key) {
            if (\in_array($key, $targetKeys)) {
                $mapping[$key] = $key;
            }
        }

        return [
            'systemDefinedFields' => array_merge($default, $mapping),
            'customFields'        => []
        ];
    }

    public static function mapEntityToSystemFields(array $entityData, array $systemMap): array
    {
        $fields = [];

        foreach ($systemMap as $sourceKey => $targetKey) {
            // Special handling for company_name to map company_id
            if ($sourceKey === 'company_name' && $targetKey === 'company_name') {
                $fields['company_id'] = $entityData['company_id'] ?? null;

                continue;
            }

            if (isset($entityData[$sourceKey])) {
                $fields[$targetKey] = $entityData[$sourceKey];
            } else {
                $fields[$targetKey] = null;
            }
        }

        $fields['reference_uuid'] = Uuid::uuidToBinary($entityData['reference_uuid']);

        return $fields;
    }

    public static function extractIdAndReferenceUuid($entities): array
    {
        $result = [];

        foreach ($entities as $entity) {
            if ($entity instanceof stdClass) {
                $entity = (array) $entity;
            }

            $result[] = [
                'id'             => $entity['id'],
                'reference_uuid' => Uuid::binaryToUuid($entity['reference_uuid']),
            ];
        }

        return $result;
    }

    /**
     * Maps source IDs to target IDs by matching on reference_uuid.
     *
     * @param array $sourceIdUuidPairs  Array of ['id' => int, 'reference_uuid' => string]
     * @param array $targetIdUuidPairs  Array of ['id' => int, 'reference_uuid' => string]
     *
     * @return array<int, int>  Map of source ID => target ID for matched pairs
     */
    public static function mapEntityIdsByReferenceUuid($sourceIdUuidPairs, $targetIdUuidPairs)
    {
        $result = [];

        if (empty($sourceIdUuidPairs) || empty($targetIdUuidPairs)) {
            return $result;
        }

        $targetReferenceMap = [];
        foreach ($targetIdUuidPairs as $targetPair) {
            $targetReferenceMap[$targetPair['reference_uuid']] = $targetPair['id'];
        }

        foreach ($sourceIdUuidPairs as $sourcePair) {
            $sourceUuid = $sourcePair['reference_uuid'];

            if (isset($targetReferenceMap[$sourceUuid])) {
                $result[$sourcePair['id']] = $targetReferenceMap[$sourceUuid];
            }
        }

        return $result;
    }

    private static function extractFieldKeys(array $fields): array
    {
        $result = [];
        self::collectFieldKeys($fields, $result);

        return $result;
    }

    private static function collectFieldKeys(array $fields, array &$result): void
    {
        foreach ($fields as $field) {
            if (!\is_array($field)) {
                continue;
            }

            $type = $field['type'] ?? null;
            if ($type === 'section') {
                continue;
            }

            if (!empty($field['group_fields']) && \is_array($field['group_fields'])) {
                self::collectFieldKeys($field['group_fields'], $result);

                continue;
            }

            if (!empty($field['is_custom'])) {
                continue;
            }

            if (isset($field['field_key']) && \is_string($field['field_key'])) {
                $result[] = $field['field_key'];
            }
        }
    }
}
