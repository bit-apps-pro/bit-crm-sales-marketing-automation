<?php

namespace BitApps\Crm\Services\Privacy;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Activity;
use BitApps\Crm\Model\Attachment;
use BitApps\Crm\Model\Company;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Model\LineItem;
use BitApps\Crm\Model\Link;
use BitApps\Crm\Model\Note;
use BitApps\Crm\Model\Tag;
use BitApps\Crm\Model\TagEntity;
use BitApps\Crm\Services\ContactService;
use BitApps\Crm\Services\DealService;
use BitApps\Crm\Services\FieldService;
use BitApps\Crm\Services\LeadService;

/**
 * Builds the WordPress personal-data export (Tools → Export Personal Data)
 * for one email address.
 *
 * WordPress calls the exporter repeatedly with an increasing $page until it
 * answers done = true. Entity records (contacts, leads, deals, invoices and
 * everything attached to them) are bounded per person and go out on page 1;
 * stored emails can be numerous, so they are paged EMAILS_PER_PAGE at a time.
 *
 * Field labels come from the same module field definitions the UI uses, so
 * renamed or custom fields (pro) export under the names the site owner sees.
 */
class PersonalDataExporter
{
    public const EMAILS_PER_PAGE = 50;

    /**
     * Columns that are bookkeeping about the record, not data about the person.
     */
    private const INTERNAL_KEYS = [
        'id', 'owner_id', 'parent_id', 'contact_id', 'company_id', 'import_id', 'reference_uuid',
        'created_by', 'updated_by', 'created_from', 'is_trash', 'status', 'is_converted',
        'conversion_details', 'created_at', 'updated_at', 'closed_at', 'home_currency_amount',
    ];

    private ExportItemFormatter $formatter;

    public function __construct()
    {
        $this->formatter = new ExportItemFormatter();
    }

    /**
     * @return array{data: array, done: bool}
     */
    public function export(string $emailAddress, int $page = 1): array
    {
        $page = max(1, $page);
        $locator = new PersonalDataLocator($emailAddress);
        $items = [];
        $emails = [];

        if ($locator->getEmail() !== '') {
            if ($page === 1) {
                $items = array_merge(
                    $this->buildContactItems($locator),
                    $this->buildLeadItems($locator),
                    $this->buildDealItems($locator),
                    $this->buildInvoiceItems($locator),
                    $this->buildRelatedItems($locator)
                );
            }

            $emails = $this->getEmailRows($locator, $page);
            $items = array_merge($items, $this->buildEmailItems($emails));
        }

        $items = Hooks::applyFilter(
            HookKeys::PRIVACY_EXPORT_GROUPS,
            $items,
            $locator->getEmail(),
            $locator->getContext() + ['page' => $page]
        );

        return [
            'data' => array_values(\is_array($items) ? $items : []),
            'done' => \count($emails) < self::EMAILS_PER_PAGE,
        ];
    }

    private function buildContactItems(PersonalDataLocator $locator): array
    {
        $ids = $locator->getContactIds();

        if (empty($ids)) {
            return [];
        }

        $labels = $this->buildFieldLabels((new ContactService())->fields());
        $rows = Contact::whereIn('id', $ids)->get();
        $items = [];

        foreach ($this->toRecords($rows) as $record) {
            $items[] = $this->formatter->buildItem(
                'contacts',
                __('CRM Contacts', 'bit-crm-sales-marketing-automation'),
                __('Contact records stored by Bit CRM.', 'bit-crm-sales-marketing-automation'),
                'contact-' . $record['id'],
                $this->buildEntityData(Contact::MODULE_NAME, $record, $labels)
            );
        }

        return $items;
    }

    private function buildLeadItems(PersonalDataLocator $locator): array
    {
        $ids = $locator->getLeadIds();

        if (empty($ids)) {
            return [];
        }

        $labels = $this->buildFieldLabels((new LeadService())->fields());
        $rows = Lead::whereIn('id', $ids)->get();
        $items = [];

        foreach ($this->toRecords($rows) as $record) {
            $items[] = $this->formatter->buildItem(
                'leads',
                __('CRM Leads', 'bit-crm-sales-marketing-automation'),
                __('Lead records stored by Bit CRM.', 'bit-crm-sales-marketing-automation'),
                'lead-' . $record['id'],
                $this->buildEntityData(Lead::MODULE_NAME, $record, $labels)
            );
        }

        return $items;
    }

    private function buildDealItems(PersonalDataLocator $locator): array
    {
        $ids = $locator->getDealIds();

        if (empty($ids)) {
            return [];
        }

        $labels = $this->buildFieldLabels((new DealService())->fields());
        $rows = Deal::whereIn('id', $ids)->get();
        $lineItems = $this->getLineItemsByEntity(Deal::MODULE_NAME, $ids);
        $items = [];

        foreach ($this->toRecords($rows) as $record) {
            $data = $this->buildEntityData(Deal::MODULE_NAME, $record, $labels);
            $this->appendLineItems($data, $lineItems[(int) $record['id']] ?? [], (string) ($record['currency'] ?? ''));

            $items[] = $this->formatter->buildItem(
                'deals',
                __('CRM Deals', 'bit-crm-sales-marketing-automation'),
                __('Deals linked to the contact records above.', 'bit-crm-sales-marketing-automation'),
                'deal-' . $record['id'],
                $data
            );
        }

        return $items;
    }

    private function buildInvoiceItems(PersonalDataLocator $locator): array
    {
        $ids = $locator->getInvoiceIds();

        if (empty($ids)) {
            return [];
        }

        $rows = Invoice::whereIn('id', $ids)->get();
        $lineItems = $this->getLineItemsByEntity(Invoice::MODULE_NAME, $ids);
        $items = [];

        foreach ($this->toRecords($rows) as $record) {
            $currency = (string) ($record['currency'] ?? '');

            $data = $this->formatter->buildPairs([
                __('Invoice number', 'bit-crm-sales-marketing-automation') => trim(($record['invoice_prefix'] ?? '') . '-' . $record['id'], '-'),
                __('Status', 'bit-crm-sales-marketing-automation')         => $record['status'] ?? '',
                __('Invoice date', 'bit-crm-sales-marketing-automation')   => $record['invoice_date'] ?? '',
                __('Due date', 'bit-crm-sales-marketing-automation')       => $record['due_date'] ?? '',
                __('Amount', 'bit-crm-sales-marketing-automation')         => trim($this->formatter->formatNumber($record['amount'] ?? '') . ' ' . $currency),
                __('Paid at', 'bit-crm-sales-marketing-automation')        => $record['paid_at'] ?? '',
                __('Sent at', 'bit-crm-sales-marketing-automation')        => $record['sent_at'] ?? '',
            ]);

            $this->appendLineItems($data, $lineItems[(int) $record['id']] ?? [], $currency);

            $items[] = $this->formatter->buildItem(
                'invoices',
                __('CRM Invoices', 'bit-crm-sales-marketing-automation'),
                __('Invoices raised on the deals above.', 'bit-crm-sales-marketing-automation'),
                'invoice-' . $record['id'],
                $data
            );
        }

        return $items;
    }

    /**
     * Line items of deals or invoices ($module), grouped by the owning record.
     *
     * @param int[] $entityIds
     *
     * @return array<int, array[]> entity id => line item rows in insertion order
     */
    private function getLineItemsByEntity(string $module, array $entityIds): array
    {
        $rows = LineItem::where('module', $module)
            ->whereIn('entity_id', $entityIds)
            ->orderBy('id')
            ->asc()
            ->get();

        $grouped = [];

        foreach ($this->toRecords($rows) as $row) {
            $grouped[(int) $row['entity_id']][] = $row;
        }

        return $grouped;
    }

    /**
     * Adds one "Line item N" row per line item to an entity's export data.
     */
    private function appendLineItems(array &$data, array $lineItems, string $currency): void
    {
        foreach (array_values($lineItems) as $index => $lineItem) {
            $data[] = [
                // translators: %d: position of the line item on the deal or invoice
                'name'  => \sprintf(__('Line item %d', 'bit-crm-sales-marketing-automation'), $index + 1),
                'value' => $this->describeLineItem($lineItem, $currency),
            ];
        }
    }

    /**
     * One readable line per deal or invoice item, e.g.
     * "Consulting (SKU-1) x 2 @ 100 = 200 USD, discount 10%, tax 5%: on-site day".
     */
    private function describeLineItem(array $lineItem, string $currency): string
    {
        $name = trim((string) ($lineItem['product_name'] ?? ''));
        $code = trim((string) ($lineItem['product_code'] ?? ''));

        if ($code !== '') {
            $name .= ' (' . $code . ')';
        }

        $parts = [
            trim(
                $name . ' x ' . $this->formatter->formatNumber($lineItem['quantity'] ?? 1)
                . ' @ ' . $this->formatter->formatNumber($lineItem['unit_price_in_deal_currency'] ?? 0)
                . ' = ' . $this->formatter->formatNumber($lineItem['total_price_in_deal_currency'] ?? 0)
                . ' ' . $currency
            ),
        ];

        if ((float) ($lineItem['discount_percentage'] ?? 0) > 0) {
            // translators: %s: discount percentage
            $parts[] = \sprintf(__('discount %s%%', 'bit-crm-sales-marketing-automation'), $this->formatter->formatNumber($lineItem['discount_percentage']));
        }

        if ((float) ($lineItem['tax_rate'] ?? 0) > 0) {
            // translators: %s: tax rate percentage
            $parts[] = \sprintf(__('tax %s%%', 'bit-crm-sales-marketing-automation'), $this->formatter->formatNumber($lineItem['tax_rate']));
        }

        $line = implode(', ', $parts);
        $description = $this->formatter->formatText($lineItem['description'] ?? '');

        return $description === '' ? $line : $line . ': ' . $description;
    }

    /**
     * Notes, activities, attachments and links recorded on the located
     * contacts and leads. The kinds differ only in model, group labels and
     * the columns worth exporting; "Linked to" and "Created" are shared.
     */
    private function buildRelatedItems(PersonalDataLocator $locator): array
    {
        $targets = array_filter([
            Contact::MODULE_NAME => $locator->getContactIds(),
            Lead::MODULE_NAME    => $locator->getLeadIds(),
        ]);

        if (empty($targets)) {
            return [];
        }

        $items = [];

        foreach ($targets as $module => $entityIds) {
            foreach ($this->getRelatedRecordKinds() as $kind) {
                $rows = $kind['model']::where('module', $module)->whereIn('entity_id', $entityIds)->get();

                foreach ($this->toRecords($rows) as $record) {
                    $items[] = $this->formatter->buildItem(
                        $kind['group'],
                        $kind['label'],
                        $kind['description'],
                        $kind['item'] . '-' . $record['id'],
                        $this->formatter->buildPairs($kind['fields']($record) + [
                            __('Linked to', 'bit-crm-sales-marketing-automation') => ucfirst($module) . ' #' . $record['entity_id'],
                            __('Created', 'bit-crm-sales-marketing-automation')   => $record['created_at'] ?? '',
                        ])
                    );
                }
            }
        }

        return $items;
    }

    /**
     * @return array<int, array{model: class-string, group: string, item: string, label: string, description: string, fields: callable(array): array}>
     */
    private function getRelatedRecordKinds(): array
    {
        return [
            [
                'model'       => Note::class,
                'group'       => 'notes',
                'item'        => 'note',
                'label'       => __('CRM Notes', 'bit-crm-sales-marketing-automation'),
                'description' => __('Notes written on the contact and lead records above.', 'bit-crm-sales-marketing-automation'),
                'fields'      => fn (array $record): array => [
                    __('Title', 'bit-crm-sales-marketing-automation')   => $record['title'] ?? '',
                    __('Details', 'bit-crm-sales-marketing-automation') => $this->formatter->formatText($record['details'] ?? ''),
                ],
            ],
            [
                'model'       => Activity::class,
                'group'       => 'activities',
                'item'        => 'activity',
                'label'       => __('CRM Activities', 'bit-crm-sales-marketing-automation'),
                'description' => __('Tasks, calls and meetings recorded on the contact and lead records above.', 'bit-crm-sales-marketing-automation'),
                'fields'      => fn (array $record): array => [
                    __('Title', 'bit-crm-sales-marketing-automation')    => $record['title'] ?? '',
                    __('Type', 'bit-crm-sales-marketing-automation')     => $record['type'] ?? '',
                    __('Due date', 'bit-crm-sales-marketing-automation') => $record['due_date'] ?? '',
                    __('Details', 'bit-crm-sales-marketing-automation')  => $this->formatter->formatText($record['details'] ?? ''),
                ],
            ],
            [
                'model'       => Attachment::class,
                'group'       => 'attachments',
                'item'        => 'attachment',
                'label'       => __('CRM Attachments', 'bit-crm-sales-marketing-automation'),
                'description' => __('Files attached to the contact and lead records above.', 'bit-crm-sales-marketing-automation'),
                'fields'      => fn (array $record): array => [
                    __('File name', 'bit-crm-sales-marketing-automation') => $record['file_name'] ?? '',
                    __('File URL', 'bit-crm-sales-marketing-automation')  => $record['media_url'] ?? '',
                    __('Type', 'bit-crm-sales-marketing-automation')      => $record['mime'] ?? '',
                ],
            ],
            [
                'model'       => Link::class,
                'group'       => 'links',
                'item'        => 'link',
                'label'       => __('CRM Links', 'bit-crm-sales-marketing-automation'),
                'description' => __('Links saved on the contact and lead records above.', 'bit-crm-sales-marketing-automation'),
                'fields'      => fn (array $record): array => [
                    __('Title', 'bit-crm-sales-marketing-automation')       => $record['title'] ?? '',
                    __('URL', 'bit-crm-sales-marketing-automation')         => $record['link'] ?? '',
                    __('Description', 'bit-crm-sales-marketing-automation') => $this->formatter->formatText($record['description'] ?? ''),
                ],
            ],
        ];
    }

    private function getEmailRows(PersonalDataLocator $locator, int $page): array
    {
        $rows = $locator->getEmailQuery()
            ->orderBy('id')
            ->asc()
            ->take(self::EMAILS_PER_PAGE)
            ->skip(($page - 1) * self::EMAILS_PER_PAGE)
            ->get();

        return $this->toRecords($rows);
    }

    private function buildEmailItems(array $records): array
    {
        $items = [];

        foreach ($records as $record) {
            $items[] = $this->formatter->buildItem(
                'emails',
                __('CRM Emails', 'bit-crm-sales-marketing-automation'),
                __('Emails stored for this address (sent from the CRM or synced from a connected mailbox).', 'bit-crm-sales-marketing-automation'),
                'email-' . $record['id'],
                $this->formatter->buildPairs([
                    __('Subject', 'bit-crm-sales-marketing-automation')   => $record['subject'] ?? '',
                    __('Date', 'bit-crm-sales-marketing-automation')      => $record['email_date'] ?? '',
                    __('Direction', 'bit-crm-sales-marketing-automation') => $record['email_direction'] ?? '',
                    __('From', 'bit-crm-sales-marketing-automation')      => $record['from_email'] ?? '',
                    __('To', 'bit-crm-sales-marketing-automation')        => $this->formatter->formatList($record['to_emails'] ?? []),
                    __('Cc', 'bit-crm-sales-marketing-automation')        => $this->formatter->formatList($record['cc'] ?? []),
                    __('Bcc', 'bit-crm-sales-marketing-automation')       => $this->formatter->formatList($record['bcc'] ?? []),
                    __('Body', 'bit-crm-sales-marketing-automation')      => $this->formatter->formatText($record['body'] ?? ''),
                ])
            );
        }

        return $items;
    }

    /**
     * Turns one entity row into name/value pairs using the module's field
     * definitions for labels, merging pro custom field values through the
     * existing MERGE_CUSTOM_FIELDS extension point.
     */
    private function buildEntityData(string $module, array $record, array $labels): array
    {
        $record = Hooks::applyFilter(HookKeys::MERGE_CUSTOM_FIELDS, $record, $module, (int) $record['id'], false);

        if (empty($labels)) {
            $labels = $this->buildFallbackLabels($record);
        }

        $data = [];

        foreach ($labels as $key => $field) {
            if (\in_array($key, self::INTERNAL_KEYS, true)) {
                continue;
            }

            $value = $this->formatter->formatValue($record[$key] ?? null, $field['options'] ?? null);

            if ($value === '') {
                continue;
            }

            $data[] = ['name' => $field['label'], 'value' => $value];
        }

        if (!empty($record['company_id']) && $company = Company::select(['name'])->findOne(['id' => (int) $record['company_id']])) {
            $data[] = ['name' => __('Company', 'bit-crm-sales-marketing-automation'), 'value' => (string) $company->name];
        }

        $tags = $this->getTagTitles($module, (int) $record['id']);

        if ($tags !== '') {
            $data[] = ['name' => __('Tags', 'bit-crm-sales-marketing-automation'), 'value' => $tags];
        }

        if (!empty($record['created_at'])) {
            $data[] = ['name' => __('Created', 'bit-crm-sales-marketing-automation'), 'value' => (string) $record['created_at']];
        }

        return $data;
    }

    /**
     * Flattens a module's field definitions (sections, address groups, custom
     * fields) into field_key => ['label', 'options'] preserving display order.
     */
    private function buildFieldLabels(array $fields): array
    {
        $labels = [];

        foreach ($fields as $field) {
            if (!\is_array($field) || ($field['type'] ?? '') === 'section') {
                continue;
            }

            if (isset($field[FieldService::GROUP_FIELDS_ARRAY_KEY]) && \is_array($field[FieldService::GROUP_FIELDS_ARRAY_KEY])) {
                foreach ($this->buildFieldLabels($field[FieldService::GROUP_FIELDS_ARRAY_KEY]) as $key => $groupField) {
                    $labels[$key] = $groupField;
                }

                continue;
            }

            if (empty($field['field_key'])) {
                continue;
            }

            $labels[$field['field_key']] = [
                'label'   => (string) ($field['label'] ?? $field['field_key']),
                'options' => isset($field['options']) && \is_array($field['options']) ? $field['options'] : null,
            ];
        }

        return $labels;
    }

    private function buildFallbackLabels(array $record): array
    {
        $labels = [];

        foreach (array_keys($record) as $key) {
            $labels[$key] = ['label' => ucwords(str_replace('_', ' ', (string) $key)), 'options' => null];
        }

        return $labels;
    }

    private function getTagTitles(string $module, int $entityId): string
    {
        $tagEntities = TagEntity::where('module', $module)->where('entity_id', $entityId)->select(['tag_id'])->get();

        if (empty($tagEntities)) {
            return '';
        }

        $tags = Tag::whereIn('id', $tagEntities->pluck('tag_id')->toArray())->select(['title'])->get();

        return empty($tags) ? '' : implode(', ', $tags->pluck('title')->toArray());
    }

    private function toRecords($rows): array
    {
        return empty($rows) ? [] : $rows->toArray();
    }
}
