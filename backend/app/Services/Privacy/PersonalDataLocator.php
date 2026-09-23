<?php

namespace BitApps\Crm\Services\Privacy;

use BitApps\Crm\Deps\BitApps\WPDatabase\QueryBuilder;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Email;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\Lead;

/**
 * Resolves which CRM records belong to one email address.
 *
 * The WordPress privacy tools identify a person solely by email address, so
 * this is the single place that decides what "the records about this person"
 * means: contacts carrying the address as primary or secondary email, leads,
 * the deals attached to those contacts (or carrying the address themselves),
 * the invoices raised on those deals, and the emails synced or sent for the
 * address. Trashed records are included: they are still stored.
 *
 * Results are memoised per instance; create a new locator per request.
 */
class PersonalDataLocator
{
    private string $email;

    /** @var null|int[] */
    private ?array $contactIds = null;

    /** @var null|int[] */
    private ?array $leadIds = null;

    /** @var null|int[] */
    private ?array $dealIds = null;

    /** @var null|int[] */
    private ?array $invoiceIds = null;

    public function __construct(string $email)
    {
        $this->email = trim($email);
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    /**
     * @return int[]
     */
    public function getContactIds(): array
    {
        if ($this->contactIds === null) {
            $this->contactIds = $this->email === ''
                ? []
                : $this->pluckIds(
                    Contact::where('email', $this->email)
                        ->orWhere('secondary_email', $this->email)
                        ->select(['id'])
                        ->get()
                );
        }

        return $this->contactIds;
    }

    /**
     * @return int[]
     */
    public function getLeadIds(): array
    {
        if ($this->leadIds === null) {
            $this->leadIds = $this->email === ''
                ? []
                : $this->pluckIds(Lead::where('email', $this->email)->select(['id'])->get());
        }

        return $this->leadIds;
    }

    /**
     * Deals attached to the located contacts, plus deals that carry the
     * address in their own email column (it is free text on the deal form).
     *
     * @return int[]
     */
    public function getDealIds(): array
    {
        if ($this->dealIds === null) {
            $ids = [];

            if ($this->email !== '') {
                $ids = $this->pluckIds(Deal::where('email', $this->email)->select(['id'])->get());
            }

            if (!empty($this->getContactIds())) {
                $ids = array_merge(
                    $ids,
                    $this->pluckIds(Deal::whereIn('contact_id', $this->getContactIds())->select(['id'])->get())
                );
            }

            $this->dealIds = array_values(array_unique($ids));
        }

        return $this->dealIds;
    }

    /**
     * @return int[]
     */
    public function getInvoiceIds(): array
    {
        if ($this->invoiceIds === null) {
            $this->invoiceIds = empty($this->getDealIds())
                ? []
                : $this->pluckIds(
                    Invoice::where('module', Deal::MODULE_NAME)
                        ->whereIn('entity_id', $this->getDealIds())
                        ->select(['id'])
                        ->get()
                );
        }

        return $this->invoiceIds;
    }

    /**
     * Emails synced or sent for the address, i.e. the rows shown on this
     * person's timeline (entity_email). An email that merely mentions the
     * address in its headers belongs to whichever contact it was synced for;
     * it is that contact's record and is deliberately not matched.
     */
    public function getEmailQuery(): QueryBuilder
    {
        return Email::where('entity_email', $this->email);
    }

    public function hasEmails(): bool
    {
        return $this->email !== '' && (int) $this->getEmailQuery()->count() > 0;
    }

    /**
     * Located record ids keyed by module — the shape shared by the privacy
     * hooks so listeners can address the same records.
     *
     * @return array{contact: int[], lead: int[], deal: int[], invoice: int[]}
     */
    public function getContext(): array
    {
        return [
            Contact::MODULE_NAME => $this->getContactIds(),
            Lead::MODULE_NAME    => $this->getLeadIds(),
            Deal::MODULE_NAME    => $this->getDealIds(),
            Invoice::MODULE_NAME => $this->getInvoiceIds(),
        ];
    }

    /**
     * @param mixed $rows
     *
     * @return int[]
     */
    private function pluckIds($rows): array
    {
        if (empty($rows)) {
            return [];
        }

        return array_values(array_map('intval', $rows->pluck('id')->toArray()));
    }
}
