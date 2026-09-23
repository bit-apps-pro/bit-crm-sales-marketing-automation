<?php

namespace BitApps\Crm\Services\Privacy;

use BitApps\Crm\Constants\HookKeys;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Attachment;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Model\Trash;
use BitApps\Crm\Services\ContactService;
use BitApps\Crm\Services\TrashService;
use BitApps\Crm\Utils\Logger;
use Throwable;

/**
 * Fulfils a WordPress personal-data erasure request (Tools → Erase Personal
 * Data) for one email address.
 *
 * Policy — deliberately the same on every install, so a site owner can state
 * it in their privacy policy:
 *
 *  - Leads, and contacts with no deals, are permanently deleted together with
 *    everything recorded on them (notes, activities, attachments, links, tags,
 *    activity logs, trash entries, pro custom field values). The Trash is
 *    bypassed: a privacy erasure is not a soft delete.
 *  - Contacts that have deals are kept as an anonymized shell so deals and
 *    invoices stay consistent business records; every personal column is
 *    blanked and the records hanging off the contact are deleted.
 *  - Deals are retained with the email column cleared. Invoices are retained
 *    untouched — they are financial records the site owner is normally
 *    obliged to keep — and reported as retained.
 *  - Emails synced or sent for the address (the person's own timeline) are
 *    deleted. Emails on other contacts' timelines that merely mention the
 *    address stay: they are those contacts' records.
 *  - Files in the Media Library are never deleted: media can be referenced
 *    from anywhere in WordPress, so it is reported for manual review instead.
 *
 * Every step is idempotent, so re-running an erasure finishes whatever an
 * earlier interrupted run left behind.
 */
class PersonalDataEraser
{
    public const STRATEGY_DELETE = 'delete';

    public const STRATEGY_ANONYMIZE = 'anonymize';

    /**
     * Contact columns that describe the record or the business relationship,
     * not the person; they survive anonymization.
     */
    private const CONTACT_COLUMNS_KEPT_ON_ANONYMIZE = [
        'owner_id', 'company_id', 'currency', 'status', 'is_trash', 'reference_uuid',
        'import_id', 'created_by', 'updated_by', 'created_from',
    ];

    private array $messages = [];

    private bool $itemsRemoved = false;

    private bool $itemsRetained = false;

    /**
     * @return array{items_removed: bool, items_retained: bool, messages: string[], done: bool}
     */
    public function erase(string $emailAddress, int $page = 1): array
    {
        $this->messages = [];
        $this->itemsRemoved = false;
        $this->itemsRetained = false;

        $locator = new PersonalDataLocator($emailAddress);
        $email = $locator->getEmail();
        $context = $locator->getContext();

        if ($email !== '') {
            try {
                $this->eraseLeads($locator, $email);
                $this->eraseContacts($locator, $email);
                $this->scrubDeals($locator, $email);
                $this->reportInvoices($locator, $email);
                $this->eraseEmails($locator);
            } catch (Throwable $th) {
                Logger::error($th);

                $this->itemsRetained = true;
                $this->messages[] = __('Bit CRM could not complete the erasure because of an unexpected error. Re-run the request; the error has been logged.', 'bit-crm-sales-marketing-automation');
            }
        }

        $response = [
            'items_removed'  => $this->itemsRemoved,
            'items_retained' => $this->itemsRetained,
            'messages'       => $this->messages,
            'done'           => true,
        ];

        $filtered = Hooks::applyFilter(HookKeys::PRIVACY_ERASURE_RESPONSE, $response, $email, $context);

        return \is_array($filtered) ? array_merge($response, $filtered) : $response;
    }

    /**
     * Column values that replace a contact's personal data when it must be
     * kept for its deals: every fillable column is blanked except the ones
     * that describe the record or the business relationship rather than the
     * person. Deriving from the model means a new personal column is erased
     * automatically instead of leaking. last_name is NOT NULL, so it carries
     * the marker.
     */
    private function getAnonymizedContactAttributes(): array
    {
        $personalColumns = array_diff((new Contact())->getFillable(), self::CONTACT_COLUMNS_KEPT_ON_ANONYMIZE);

        $attributes = array_fill_keys($personalColumns, null);
        $attributes['last_name'] = $this->getAnonymizedName();

        return $attributes;
    }

    private function getAnonymizedName(): string
    {
        return __('Anonymized contact', 'bit-crm-sales-marketing-automation');
    }

    private function eraseLeads(PersonalDataLocator $locator, string $email): void
    {
        $ids = $locator->getLeadIds();

        if (empty($ids)) {
            return;
        }

        $this->deleteEntities(
            new Lead(),
            $ids,
            $email,
            // translators: %d: number of leads
            _n('%d lead was permanently deleted.', '%d leads were permanently deleted.', \count($ids), 'bit-crm-sales-marketing-automation'),
            // translators: %d: number of leads
            _n('%d lead could not be deleted.', '%d leads could not be deleted.', \count($ids), 'bit-crm-sales-marketing-automation')
        );
    }

    private function eraseContacts(PersonalDataLocator $locator, string $email): void
    {
        $ids = $locator->getContactIds();

        if (empty($ids)) {
            return;
        }

        $withDeals = array_map('intval', (new ContactService())->getIdsWithAssociations($ids));
        $toAnonymize = array_values(array_intersect($ids, $withDeals));
        $toDelete = array_values(array_diff($ids, $withDeals));

        if (!empty($toDelete)) {
            $this->deleteEntities(
                new Contact(),
                $toDelete,
                $email,
                // translators: %d: number of contacts
                _n('%d contact was permanently deleted with its notes, activities, attachments, links and tags.', '%d contacts were permanently deleted with their notes, activities, attachments, links and tags.', \count($toDelete), 'bit-crm-sales-marketing-automation'),
                // translators: %d: number of contacts
                _n('%d contact could not be deleted.', '%d contacts could not be deleted.', \count($toDelete), 'bit-crm-sales-marketing-automation')
            );
        }

        if (!empty($toAnonymize)) {
            $attachments = $this->countAttachments(Contact::MODULE_NAME, $toAnonymize);
            $this->anonymizeContacts($toAnonymize, $email);
            $this->reportRemoved(
                // translators: %d: number of contacts
                _n('%d contact is linked to deals and was anonymized instead of deleted: all personal details were removed and its notes, activities, attachments, links and tags were deleted.', '%d contacts are linked to deals and were anonymized instead of deleted: all personal details were removed and their notes, activities, attachments, links and tags were deleted.', \count($toAnonymize), 'bit-crm-sales-marketing-automation'),
                \count($toAnonymize)
            );
            $this->reportAttachmentMedia($attachments);
        }
    }

    private function scrubDeals(PersonalDataLocator $locator, string $email): void
    {
        $ids = $locator->getDealIds();

        if (empty($ids)) {
            return;
        }

        Hooks::doAction(HookKeys::PRIVACY_ERASE_ENTITIES, Deal::MODULE_NAME, $ids, self::STRATEGY_ANONYMIZE, $email);

        Deal::whereIn('id', $ids)->update(['email' => null]);

        $this->reportRetained(
            // translators: %d: number of deals
            _n('%d deal was retained as a business record; the email address stored on it was removed.', '%d deals were retained as business records; the email address stored on them was removed.', \count($ids), 'bit-crm-sales-marketing-automation'),
            \count($ids)
        );
    }

    private function reportInvoices(PersonalDataLocator $locator, string $email): void
    {
        $ids = $locator->getInvoiceIds();

        if (empty($ids)) {
            return;
        }

        Hooks::doAction(HookKeys::PRIVACY_ERASE_ENTITIES, Invoice::MODULE_NAME, $ids, self::STRATEGY_ANONYMIZE, $email);

        $this->reportRetained(
            // translators: %d: number of invoices
            _n('%d invoice was retained for accounting and record-keeping purposes.', '%d invoices were retained for accounting and record-keeping purposes.', \count($ids), 'bit-crm-sales-marketing-automation'),
            \count($ids)
        );
    }

    private function eraseEmails(PersonalDataLocator $locator): void
    {
        $count = (int) $locator->getEmailQuery()->count();

        if ($count === 0) {
            return;
        }

        $locator->getEmailQuery()->delete();

        $this->reportRemoved(
            // translators: %d: number of emails
            _n('%d email stored for this address was deleted. Copies may still exist in the connected mailbox, which Bit CRM does not control.', '%d emails stored for this address were deleted. Copies may still exist in the connected mailbox, which Bit CRM does not control.', $count, 'bit-crm-sales-marketing-automation'),
            $count
        );
    }

    /**
     * Permanently deletes entities with everything attached to them and
     * reports the outcome. Listeners are told first, while the ids still
     * resolve; attachments are counted first because their rows go with the
     * entity but their files stay in the Media Library.
     *
     * @param Contact|Lead $model
     * @param int[]        $ids
     */
    private function deleteEntities($model, array $ids, string $email, string $removedMessage, string $retainedMessage): void
    {
        $attachments = $this->countAttachments($model::MODULE_NAME, $ids);

        Hooks::doAction(HookKeys::PRIVACY_ERASE_ENTITIES, $model::MODULE_NAME, $ids, self::STRATEGY_DELETE, $email);

        if (!TrashService::deleteEntitiesWithRelations($model, $ids)) {
            $this->reportRetained($retainedMessage, \count($ids));

            return;
        }

        $this->reportRemoved($removedMessage, \count($ids));
        $this->reportAttachmentMedia($attachments);
    }

    /**
     * @param int[] $ids
     */
    private function anonymizeContacts(array $ids, string $email): void
    {
        Hooks::doAction(HookKeys::PRIVACY_ERASE_ENTITIES, Contact::MODULE_NAME, $ids, self::STRATEGY_ANONYMIZE, $email);

        Contact::whereIn('id', $ids)->update($this->getAnonymizedContactAttributes());

        // After the update so anything a listener logged on the contact goes too.
        $this->deleteRelatedRecords($ids);

        // The trash row is kept so the contact stays reachable; only its copy of the name is erased.
        Trash::where('module', Contact::MODULE_NAME)
            ->whereIn('entity_id', $ids)
            ->update(['full_name' => $this->getAnonymizedName()]);
    }

    /**
     * Deletes everything recorded on the given contacts through the
     * (module, entity_id) convention — Contact::RELATED_MODELS plus whatever
     * the pro plugin appends via ENTITY_RELATED_MODELS — while leaving the
     * contact rows themselves in place. TrashService offers the same cleanup
     * only bundled with deleting the contact, which is what must not happen
     * here; contacts are the only entity an erasure keeps.
     *
     * The trash row is the exception: it indexes a contact that survives, so
     * deleting it would strand the record outside both the contact list and
     * the Trash screen. The caller anonymizes the name it copies instead.
     *
     * @param int[] $ids
     */
    private function deleteRelatedRecords(array $ids): void
    {
        $relatedModels = Hooks::applyFilter(HookKeys::ENTITY_RELATED_MODELS, Contact::RELATED_MODELS);

        foreach ($relatedModels as $relatedModel) {
            if ($relatedModel === Trash::class) {
                continue;
            }

            $query = $relatedModel::where('module', Contact::MODULE_NAME)->whereIn('entity_id', $ids);

            if ($query->count()) {
                $query->delete();
            }
        }
    }

    /**
     * @param int[] $ids
     */
    private function countAttachments(string $module, array $ids): int
    {
        return (int) Attachment::where('module', $module)->whereIn('entity_id', $ids)->count();
    }

    /**
     * Attachment rows go with the entity, but the files stay in the Media
     * Library (see class docblock); tell the administrator to look at them.
     */
    private function reportAttachmentMedia(int $count): void
    {
        if ($count === 0) {
            return;
        }

        $this->reportRetained(
            // translators: %d: number of attachments
            _n('%d attachment record was removed, but the uploaded file remains in the Media Library and should be reviewed manually.', '%d attachment records were removed, but the uploaded files remain in the Media Library and should be reviewed manually.', $count, 'bit-crm-sales-marketing-automation'),
            $count
        );
    }

    private function reportRemoved(string $template, int $count): void
    {
        $this->itemsRemoved = true;
        $this->messages[] = \sprintf($template, $count);
    }

    private function reportRetained(string $template, int $count): void
    {
        $this->itemsRetained = true;
        $this->messages[] = \sprintf($template, $count);
    }
}
