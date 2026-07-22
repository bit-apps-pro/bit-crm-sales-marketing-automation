<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Helpers\Uuid;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Model\Attachment;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Model\Link;
use BitApps\Crm\Model\Note;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Model\TagEntity;
use BitApps\Crm\src\StaticData\CurrencyHelper;
use Exception;

class LeadConvertService
{
    private array $mapping = [];

    private array $ids;

    private ?int $defaultOwnerId;

    private array $options = [];

    private LeadService $leadService;

    private array $activeStages = [];

    private string $fallbackStageKey = '';

    private array $currencies = [];

    private string $homeCurrency = '';

    /** @var iterable inserted company models awaiting the company_created hook */
    private $createdCompanies = [];

    /** @var iterable inserted contact models awaiting the contact_created hook */
    private $createdContacts = [];

    /** @var iterable inserted deal models awaiting the deal_created hook */
    private $createdDeals = [];

    /**
     * Initialize the Lead Conversion Service.
     *
     * @param array    $ids                   lead IDs to convert
     * @param null|int $defaultOwnerId        owner ID for converted entities (overrides lead owner)
     * @param array    $options conversion options (convertTo, moveRelatedData, moveRelatedDataTo, moveTagsTo)
     * @param array    $mapping field mapping configuration
     */
    public function __construct(array $ids = [], ?int $defaultOwnerId = null, array $options = [], array $mapping = [])
    {
        $this->ids = $ids;

        $this->defaultOwnerId = $defaultOwnerId;

        $this->setOptions($options);

        $this->mapping = $mapping;

        $this->leadService = new LeadService();
    }

    /**
     * Convert leads to companies.
     *
     * Creates new company records from leads, excludes leads with existing companies,
     * moves related data and tags based on conversion preferences.
     *
     * @throws Exception if company insertion fails
     *
     * @return null|array array of inserted companies or null if no leads to convert
     */
    public function convertToCompanies()
    {
        $data = $this->leadService->search(['ids' => $this->ids]);
        $leads = $data['data'] ?? [];

        if (empty($leads)) {
            return;
        }

        $filteredLeads = $this->excludeExistingCompanyLeads($leads);

        $systemDefinedValues = $this->prepareLeadsData(
            $filteredLeads,
            $this->getMapping(Company::MODULE_NAME),
            Company::MODULE_NAME
        );

        if (empty($systemDefinedValues)) {
            return;
        }

        $insertedCompanies = Company::insert($systemDefinedValues);

        if (!$insertedCompanies) {
            throw new Exception('Failed to insert companies during lead conversion.');
        }

        $leadIdToCompanyId = $this->mapLeadIdToCompanyId($leads);

        Hooks::doAction(HookKeys::TRANSFER_CONVERTED_CUSTOM_FIELDS, Company::MODULE_NAME, $leadIdToCompanyId, $this->mapping[Company::MODULE_NAME]['customFields'] ?? [], []);

        $this->moveLeadData($leadIdToCompanyId, Company::class);
        $this->moveTags($leadIdToCompanyId, Company::class);
        $this->createdCompanies = $insertedCompanies;

        return $insertedCompanies->toArray();
    }

    /**
     * Convert leads to contacts.
     *
     * Creates new contact records from leads, assigns company IDs if company names match,
     * moves related data and tags based on preferences, and marks leads as converted.
     *
     * @throws Exception if no leads found or contact insertion fails
     *
     * @return array array of inserted contacts
     */
    public function convertToContacts()
    {
        $data = $this->leadService->search(['ids' => $this->ids]);
        $leads = $data['data'] ?? [];

        if (empty($leads)) {
            throw new Exception('No leads found for the provided IDs.');
        }

        $this->assignCompanyIds($leads);

        $systemDefinedValues = $this->prepareLeadsData(
            $leads,
            $this->getMapping(Contact::MODULE_NAME),
            Contact::MODULE_NAME
        );

        $insertedContacts = Contact::insert($systemDefinedValues);

        if (!$insertedContacts) {
            throw new Exception('Failed to insert contacts during lead conversion.');
        }

        $contactsIds = ConvertService::extractIdAndReferenceUuid($insertedContacts->toArray());

        $leadsIds = ConvertService::extractIdAndReferenceUuid($leads);

        $leadIdToContactId = ConvertService::mapEntityIdsByReferenceUuid($leadsIds, $contactsIds);

        Hooks::doAction(HookKeys::TRANSFER_CONVERTED_CUSTOM_FIELDS, Contact::MODULE_NAME, $leadIdToContactId, $this->mapping[Contact::MODULE_NAME]['customFields'] ?? [], []);

        $this->moveLeadData($leadIdToContactId, Contact::class);
        $this->moveTags($leadIdToContactId, Contact::class);
        $this->createdContacts = $insertedContacts;

        return $insertedContacts->toArray();
    }

    /**
     * Convert leads to deals.
     *
     * Creates new deal records from leads, assigns company IDs and contact IDs
     * from the previously converted entities. Moves related data and tags based
     * on conversion preferences.
     *
     * @param array $insertedContacts array of inserted contact records
     *
     * @throws Exception if deal insertion fails
     *
     * @return null|array array of inserted deals or null if deal conversion is not requested
     */
    public function convertToDeals(array $insertedContacts)
    {
        $shouldConvertToDeal = \in_array(Deal::MODULE_NAME, $this->options['convertTo']);

        if (!$shouldConvertToDeal) {
            return;
        }

        $data = $this->leadService->search(['ids' => $this->ids]);
        $leads = $data['data'] ?? [];

        if (empty($leads)) {
            return;
        }

        $this->assignCompanyIds($leads);

        $this->initDealConversionData();

        $leadsIds = ConvertService::extractIdAndReferenceUuid($leads);
        $contactsIds = ConvertService::extractIdAndReferenceUuid($insertedContacts);
        $leadIdToContactId = ConvertService::mapEntityIdsByReferenceUuid($leadsIds, $contactsIds);

        $systemDefinedValues = $this->prepareDealsData(
            $leads,
            $this->getMapping(Deal::MODULE_NAME),
            $leadIdToContactId,
        );

        $insertedDeals = Deal::insert($systemDefinedValues);

        if (!$insertedDeals) {
            throw new Exception(esc_html__('Failed to insert deals during lead conversion.', 'bit-crm-sales-marketing-automation'));
        }

        $dealsIds = ConvertService::extractIdAndReferenceUuid($insertedDeals->toArray());

        $leadIdToDealId = ConvertService::mapEntityIdsByReferenceUuid($leadsIds, $dealsIds);

        $customFieldMap = $this->mapping[Deal::MODULE_NAME]['customFields'] ?? [];
        $customFieldOverrides = $this->options['dealFieldOverrides']['customFieldsValues'] ?? [];
        Hooks::doAction(HookKeys::TRANSFER_CONVERTED_CUSTOM_FIELDS, Deal::MODULE_NAME, $leadIdToDealId, $customFieldMap, $customFieldOverrides);

        $this->moveLeadData($leadIdToDealId, Deal::class);
        $this->moveTags($leadIdToDealId, Deal::class);
        $this->createdDeals = $insertedDeals;

        return $insertedDeals->toArray();
    }

    /**
     * Fire the standard entity-creation hooks for converted entities.
     *
     * Conversion inserts contacts/companies/deals in bulk, bypassing the per-entity
     * hooks that the normal store() flow fires. This mirrors that behaviour so
     * workflow triggers (contact_created, company_created, deal_created) run for
     * converted entities too.
     *
     * MUST be called by the caller AFTER Connection::commit(), never inside the
     * transaction, so listeners never read uncommitted or rolled-back rows.
     */
    public function dispatchCreationHooks(): void
    {
        $this->fireCreatedHooks($this->createdCompanies, 'bit_crm/company_created');
        $this->fireCreatedHooks($this->createdContacts, 'bit_crm/contact_created');
        $this->fireCreatedHooks($this->createdDeals, 'bit_crm/deal_created');
    }

    /**
     * Fire all post-conversion hooks from inside a background worker.
     *
     * Forces workflow triggers to run inline: spawning another loopback
     * background process from within an already-running worker hangs. The
     * pro workflow executor honours this filter; the filter is always
     * restored, even if a listener throws.
     *
     * Use dispatchCreationHooks() directly from web requests instead, where
     * async workflow dispatch works and keeps the response fast.
     */
    public function dispatchCreationHooksFromWorker(): void
    {
        Hooks::addFilter(HookKeys::RUN_WORKFLOW_EXECUTION_INLINE, '__return_true');

        try {
            $this->dispatchCreationHooks();
            Hooks::doAction('bit_crm/leads_converted_to_contact', array_map('intval', $this->ids));
        } finally {
            Hooks::removeFilter(HookKeys::RUN_WORKFLOW_EXECUTION_INLINE, '__return_true');
        }
    }

    /**
     * Assign company IDs to leads based on company name matching.
     *
     * Looks up existing companies by name and assigns their IDs to corresponding leads.
     *
     * @param array $leads array of lead objects (passed by reference)
     */
    public function assignCompanyIds(&$leads): void
    {
        $companyNames = [];
        foreach ($leads as $lead) {
            if (!empty($lead->company_name)) {
                $companyNames[] = $lead->company_name;
            }
        }

        if (empty($companyNames)) {
            return;
        }

        $companiesQuery = Company::whereIn('name', array_unique($companyNames))
            ->select(['id', 'name'])->get();

        if (empty($companiesQuery)) {
            return;
        }

        $companies = $companiesQuery->toArray();

        $companyNameToIdMap = [];
        foreach ($companies as $company) {
            $companyNameToIdMap[$company['name']] = $company['id'];
        }

        foreach ($leads as &$lead) {
            if (isset($companyNameToIdMap[$lead->company_name])) {
                $lead->company_id = $companyNameToIdMap[$lead->company_name];
            } else {
                $lead->company_id = null;
            }
        }
    }

    /**
     * Fire a per-entity *_created hook for each inserted model.
     *
     * The reference_uuid is normalized from its stored binary form to string,
     * matching what the entity Service store() methods pass to these hooks.
     *
     * @param iterable $entities inserted models
     */
    private function fireCreatedHooks($entities, string $hook): void
    {
        foreach ($entities as $entity) {
            if (isset($entity->reference_uuid)) {
                $entity->reference_uuid = Uuid::binaryToUuid($entity->reference_uuid);
            }

            Hooks::doAction($hook, $entity);
        }
    }

    private function getMapping(string $module): array
    {
        return $this->mapping[$module] ?? ['systemDefinedFields' => [], 'customFields' => []];
    }

    private function setOptions(array $options): void
    {
        $this->options = wp_parse_args(
            $options,
            [
                'convertTo'       => [Contact::MODULE_NAME, Company::MODULE_NAME],
                'moveRelatedData' => [
                    Activity::MODULE_NAME,
                    Attachment::MODULE_NAME,
                    Note::MODULE_NAME,
                    Link::MODULE_NAME,
                ],
                'moveRelatedDataTo' => Contact::MODULE_NAME,
                'moveTagsTo'        => [],
            ]
        );
    }

    /**
     * Maps lead IDs to their associated company IDs.
     *
     * This method first assigns company IDs to the provided leads, then creates
     * a mapping array where lead IDs are keys and company IDs are values.
     * Only leads with non-empty company IDs are included in the resulting map.
     *
     * @param array $leads Array of lead objects to process
     *
     * @return array Associative array mapping lead IDs to company IDs
     *               Format: [lead_id => company_id]
     *               Only includes leads that have a company_id assigned
     */
    private function mapLeadIdToCompanyId(array $leads): array
    {
        $this->assignCompanyIds($leads);

        $leadIdToCompanyId = [];
        foreach ($leads as $lead) {
            if (!empty($lead->company_id)) {
                $leadIdToCompanyId[$lead->id] = $lead->company_id;
            }
        }

        return $leadIdToCompanyId;
    }

    /**
     * Filter out leads that have company names already existing in the database.
     *
     * Keeps only one lead per unique company name and removes those with duplicate companies.
     *
     * @param array $leads array of lead objects (passed by reference)
     */
    private function excludeExistingCompanyLeads(array $leads): array
    {
        $filteredLeads = [];

        foreach ($leads as $lead) {
            $companyName = $lead->company_name ?? '';

            if (empty($companyName)) {
                continue;
            }

            if (!isset($filteredLeads[$companyName])) {
                $filteredLeads[$companyName] = $lead;
            }
        }

        if (empty($filteredLeads)) {
            return [];
        }

        $existingCompanyNames = Company::whereIn('name', array_keys($filteredLeads))
            ->select(['name'])
            ->get();


        if (!empty($existingCompanyNames)) {
            $existingCompanyNames = $existingCompanyNames->pluck('name')->toArray();

            foreach ($existingCompanyNames as $existingName) {
                unset($filteredLeads[$existingName]);
            }
        }

        return array_values($filteredLeads);
    }

    /**
     * Prepare lead data for conversion by mapping to target module fields.
     *
     * Separates system-defined fields and custom fields based on the provided mapping.
     *
     * @param array $leads   array of lead objects
     * @param array $mapping field mapping configuration
     *
     * @return array [system fields array, custom fields array]
     */
    private function prepareLeadsData(array $leads, array $mapping, string $moduleName): array
    {
        $systemDefinedValues = [];

        foreach ($leads as $lead) {
            $lead = (array) $lead;
            $lead['reference_uuid'] = Uuid::binaryToUuid($lead['reference_uuid']);

            $systemFields = ConvertService::mapEntityToSystemFields($lead, $mapping['systemDefinedFields'] ?? []);
            $systemFields['created_by'] = get_current_user_id();
            if ($this->defaultOwnerId) {
                $systemFields['owner_id'] = $this->defaultOwnerId;
            }

            if ($moduleName === Contact::MODULE_NAME) {
                $systemFields['company_id'] = $lead['company_id'] ?? null;
            }

            $systemDefinedValues[] = $systemFields;
        }

        return $systemDefinedValues;
    }

    /**
     * Prepare deal data for conversion by mapping to deal fields.
     *
     * Handles deal-specific logic including contact ID assignment, stage validation,
     * and probability calculation in a single pass.
     *
     * @param array  $leads              array of lead objects
     * @param array  $mapping            field mapping configuration
     * @param array  $leadIdToContactId  map of lead IDs to contact IDs
     *
     * @return array [system fields array, custom fields array]
     */
    private function prepareDealsData(
        array $leads,
        array $mapping,
        array $leadIdToContactId,
    ): array {
        $systemDefinedValues = [];

        foreach ($leads as $lead) {
            $lead = (array) $lead;
            $lead['reference_uuid'] = Uuid::binaryToUuid($lead['reference_uuid']);
            $leadId = $lead['id'];

            $systemFields = ConvertService::mapEntityToSystemFields($lead, $mapping['systemDefinedFields'] ?? []);
            $systemFields['created_by'] = get_current_user_id();

            if ($this->defaultOwnerId) {
                $systemFields['owner_id'] = $this->defaultOwnerId;
            }

            $systemFields['company_id'] = $lead['company_id'] ?? null;

            if (isset($leadIdToContactId[$leadId])) {
                $systemFields['contact_id'] = $leadIdToContactId[$leadId];
            }

            $this->mapSystemFieldOverrides($systemFields, $lead);
            $systemDefinedValues[] = $systemFields;
        }

        return $systemDefinedValues;
    }

    private function initDealConversionData(): void
    {
        $dealStageService = new DealStageService();
        $activeStages = $dealStageService->getAllStages(DealStageService::STATUS_ACTIVE);
        $this->activeStages = $activeStages;
        $this->fallbackStageKey = $dealStageService->getInitialStageKey();
        $this->currencies = Hooks::applyFilter(HookKeys::OTHER_CURRENCIES_DATA, []);
        $this->homeCurrency = CurrencyHelper::getHomeCurrency();
    }

    /**
     * Applies system-defined field overrides (name, stage, currency, etc.) to the deal array.
     *
     * @param array $deal deal data to mutate
     * @param array $lead source lead data for field rendering
     *
     * @throws Exception if the resolved deal name is empty
     */
    private function mapSystemFieldOverrides(array &$deal, array $lead): void
    {
        $fieldOverrides = $this->options['dealFieldOverrides']['systemDefinedFieldsValues'] ?? [];

        foreach ($fieldOverrides as $key => $value) {
            if ($key === 'name') {
                $name = EntityFieldService::renderFields($value, $lead);
                if (!$name || trim($name) === '') {
                    throw new Exception(esc_html__('Deal name cannot be empty. Please provide a valid name mapping or override value.', 'bit-crm-sales-marketing-automation'));
                }
                $deal['name'] = $name;

                continue;
            }

            if ($value === '' || $value === null) {
                continue;
            }

            if ($key === 'stage') {
                $deal['stage'] = $value;

                $stageProbability = $this->activeStages[$value]['probability'] ?? null;
                $deal['probability'] = $stageProbability;

                continue;
            }

            $deal[$key] = $value;
        }

        $this->applyDealFieldFallbacks($deal);
    }

    /**
     * Ensures stage and currency fall back to defaults when missing or invalid.
     *
     * @param array $deal deal data to mutate
     */
    private function applyDealFieldFallbacks(array &$deal): void
    {
        if (!isset($deal['stage']) || empty($deal['stage'])) {
            $deal['stage'] = $this->fallbackStageKey;
            $deal['probability'] = $this->activeStages[$this->fallbackStageKey]['probability'] ?? null;
        }

        if (!isset($deal['currency']) || !isset($this->currencies[$deal['currency']])) {
            $deal['currency'] = $this->homeCurrency;
        }
    }

    /**
     * Move or delete related data from leads to converted entities.
     *
     * Transfers activities, attachments, notes, and links to the target entity or deletes them
     * based on the moveRelatedData configuration. Skips if $moveRelatedDataTo does not match
     * the target entity module.
     *
     * @param array  $leadIdToEntityId map of lead IDs to converted entity IDs
     * @param string $entityModel      target entity model class
     */
    private function moveLeadData(array $leadIdToEntityId, $entityModel): void
    {
        if (empty($leadIdToEntityId)) {
            return;
        }

        if (($this->options['moveRelatedDataTo'] ?? null) !== $entityModel::MODULE_NAME) {
            return;
        }

        $moveRelatedData = $this->options['moveRelatedData'];

        $leadIds = array_keys($leadIdToEntityId);

        foreach (Lead::RELATED_LIST_MODELS as $relatedModel) {
            $shouldNotMove = !\in_array($relatedModel::MODULE_NAME, $moveRelatedData);

            if ($shouldNotMove) {
                $query = $relatedModel::where('module', Lead::MODULE_NAME)->whereIn('entity_id', $leadIds);

                if (!$query->count()) {
                    continue;
                }

                $query->delete();

                continue;
            }

            $caseStatement = [];
            foreach ($leadIdToEntityId as $leadId => $entityId) {
                $caseStatement[] = "WHEN entity_id = {$leadId} THEN {$entityId}";
            }

            $relatedModelTable = (new $relatedModel())->getTable();

            $idsPlaceholder = implode(',', array_fill(0, \count($leadIds), '%d'));
            $query = "
                UPDATE {$relatedModelTable}
                SET entity_id = CASE " . implode(' ', $caseStatement) . " END,
                    module = %s
                WHERE module = %s
                AND entity_id IN ({$idsPlaceholder})
            ";

            $relatedModel::raw($query, [$entityModel::MODULE_NAME, Lead::MODULE_NAME, ...$leadIds]);
        }
    }

    /**
     * Move tags from leads to converted entities.
     *
     * Creates new tags if they don't exist in target module and associates them with converted entities.
     *
     * @param array  $leadIdToEntityId map of lead IDs to converted entity IDs
     * @param string $targetModuleModel target module model class
     */
    private function moveTags($leadIdToEntityId, $targetModuleModel): void
    {
        if (empty($leadIdToEntityId)) {
            return;
        }

        if (!\in_array($targetModuleModel::MODULE_NAME, $this->options['moveTagsTo'] ?? [])) {
            return;
        }

        $leadIds = array_keys($leadIdToEntityId);

        $leadTags = $this->leadService->getTagsByIds($leadIds, true);

        if (empty($leadTags)) {
            return;
        }

        $existingTargetModuleTagsQuery = Tag::where('module', $targetModuleModel::MODULE_NAME)
            ->select(['slug'])
            ->get();

        $existingTargetModuleTags = [];
        if (!empty($existingTargetModuleTagsQuery)) {
            $existingTargetModuleTags = $existingTargetModuleTagsQuery->pluck('slug')
                ->toArray();
        }

        $uniqueLeadTags = [];
        $leadTagSlugs = [];

        foreach ($leadTags as $leadTag) {
            if (!\in_array($leadTag['slug'], $existingTargetModuleTags)) {
                $uniqueLeadTags[] = [
                    'title'     => $leadTag['title'],
                    'slug'      => $leadTag['slug'],
                    'module'    => $targetModuleModel::MODULE_NAME,
                    'is_pinned' => 0
                ];
                $leadTagSlugs[] = $leadTag['slug'];
            }
        }

        if (!empty($uniqueLeadTags)) {
            Tag::insert($uniqueLeadTags);
        }

        $allTargetModuleTagsQuery = Tag::where('module', $targetModuleModel::MODULE_NAME)
            ->whereIn('slug', array_merge($existingTargetModuleTags, $leadTagSlugs))
            ->select(['id', 'slug'])
            ->get()
            ->toArray();

        $allTargetModuleTags = [];
        foreach ($allTargetModuleTagsQuery as $tag) {
            $allTargetModuleTags[$tag['slug']] = $tag['id'];
        }

        $leadTagAssociations = $this->leadService->getTagsByIds($leadIds, false);

        $newTagEntities = [];

        foreach ($leadTagAssociations as $association) {
            $leadId = $association['lead_id'];
            $targetModuleId = $leadIdToEntityId[$leadId];
            $tagSlug = $association['slug'];

            if (isset($allTargetModuleTags[$tagSlug])) {
                $targetModuleTagId = $allTargetModuleTags[$tagSlug];

                $newTagEntities[] = [
                    'entity_id' => $targetModuleId,
                    'tag_id'    => $targetModuleTagId,
                    'module'    => $targetModuleModel::MODULE_NAME
                ];
            }
        }

        if (!empty($newTagEntities)) {
            TagEntity::insert($newTagEntities);
        }
    }
}
