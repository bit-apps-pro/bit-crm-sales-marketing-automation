<?php

use BitApps\Crm\Model\InvoicePayment;
use BitApps\Crm\Services\InvoiceLedgerService;

/**
 * Covers the normalization a manually recorded settlement goes through before
 * it reaches the ledger. These are the rules that keep a manual row
 * reconcilable: a GMT timestamp that is never in the future, and a
 * locally-minted identity unique per row.
 *
 * @internal
 *
 * @coversNothing
 */
class ManualPaymentTest extends BaseTestCase
{
    private $service;

    public function setUp(): void
    {
        parent::setUp();

        $this->service = new InvoiceLedgerService();
    }

    /**
     * A settlement cannot have arrived after it was recorded, so a future
     * date is clamped to now rather than stored.
     *
     * @test
     *
     * @group api
     */
    public function clampsFuturePaidAtToNow()
    {
        $now = current_time('mysql', true);
        $future = gmdate('Y-m-d H:i:s', strtotime($now . ' +10 days'));

        $this->assertLessThanOrEqual(
            current_time('mysql', true),
            $this->invoke('normalizeManualPaidAt', $future)
        );
    }

    /**
     * @test
     *
     * @group api
     */
    public function fallsBackToNowForUnparsablePaidAt()
    {
        $this->assertNotEmpty($this->invoke('normalizeManualPaidAt', 'not-a-date'));
        $this->assertNotEmpty($this->invoke('normalizeManualPaidAt', ''));
        $this->assertNotEmpty($this->invoke('normalizeManualPaidAt', null));
    }

    /**
     * A past settlement date is what admins actually enter ("the cheque
     * cleared last Tuesday"), so it must survive normalization.
     *
     * @test
     *
     * @group api
     */
    public function keepsPastPaidAt()
    {
        $past = gmdate('Y-m-d H:i:s', strtotime('-5 days'));
        $normalized = $this->invoke('normalizeManualPaidAt', $past);

        $this->assertLessThan(current_time('mysql', true), $normalized);
    }

    /**
     * The ledger identity of a manual row is minted locally, so it must be
     * unique per row or two settlements would collide.
     *
     * @test
     *
     * @group api
     */
    public function mintsUniqueManualPaymentRef()
    {
        $first = $this->invoke('manualPaymentRef', 1);
        $second = $this->invoke('manualPaymentRef', 1);

        $this->assertStringStartsWith(InvoicePayment::PROVIDER_MANUAL, $first);
        $this->assertNotEquals($first, $second);
    }

    /**
     * The picker sends its value as ISO-8601 with an explicit offset, the way
     * `invoice_date`/`due_date` are sent. Such a value is already absolute,
     * so it must be formatted as GMT rather than converted a second time —
     * the double shift silently stored the payment hours early on any site
     * whose timezone is not UTC.
     *
     * @test
     *
     * @group api
     */
    public function keepsAnIsoPaidAtAtTheSameInstant()
    {
        // 09:00 UTC, stated as an offset time: the same instant either way.
        $this->assertSame(
            '2020-03-05 09:00:00',
            $this->invoke('normalizeManualPaidAt', '2020-03-05T09:00:00.000Z')
        );

        $this->assertSame(
            '2020-03-05 09:00:00',
            $this->invoke('normalizeManualPaidAt', '2020-03-05T15:00:00+06:00')
        );
    }

    /**
     * A value with no offset is site time — what a hand-built request or an
     * older client sends — and still goes through the site→GMT conversion.
     *
     * @test
     *
     * @group api
     */
    public function treatsAnOffsetLessPaidAtAsSiteTime()
    {
        $siteTime = '2020-03-05 09:00:00';

        $this->assertSame(
            get_gmt_from_date($siteTime),
            $this->invoke('normalizeManualPaidAt', $siteTime)
        );
    }

    /**
     * A zero-total invoice owes nothing, but it is covered only once a
     * completed row exists. Otherwise every status sync would flip a sent $0
     * invoice to `paid`, and recordManualPayment() would refuse the first row
     * as redundant.
     *
     * @test
     *
     * @group api
     */
    public function treatsAZeroTotalInvoiceAsCoveredOnlyOnceMarkedPaid()
    {
        $this->assertFalse(
            $this->isCovered(['total' => 0.0, 'paid' => 0.0, 'has_completed_payment' => false, 'decimal_places' => 2]),
            'a sent $0 invoice with no completed row is not covered'
        );

        $this->assertFalse(
            $this->isCovered(['total' => 0.0, 'paid' => 0.0, 'decimal_places' => 2]),
            'a summary without the flag is treated as having no completed row'
        );

        $this->assertTrue(
            $this->isCovered(['total' => 0.0, 'paid' => 0.0, 'has_completed_payment' => true, 'decimal_places' => 2]),
            'a $0 invoice is covered once it has been marked paid'
        );
    }

    /**
     * The coverage rule for invoices that carry a real amount is unchanged:
     * only completed payments meeting the total (within rounding slack) count.
     *
     * @test
     *
     * @group api
     */
    public function coversAnInvoiceOnlyOnceItsTotalIsMet()
    {
        $this->assertFalse(
            $this->isCovered(['total' => 100.0, 'paid' => 0.0, 'decimal_places' => 2]),
            'an untouched invoice is not covered'
        );

        $this->assertFalse(
            $this->isCovered(['total' => 100.0, 'paid' => 40.0, 'decimal_places' => 2]),
            'a partial payment does not cover the total'
        );

        $this->assertTrue(
            $this->isCovered(['total' => 100.0, 'paid' => 100.0, 'decimal_places' => 2]),
            'an exactly met total is covered'
        );

        $this->assertTrue(
            $this->isCovered(['total' => 100.0, 'paid' => 99.999, 'decimal_places' => 2]),
            'a sub-cent shortfall is within rounding slack'
        );

        $this->assertTrue(
            $this->isCovered(['total' => 100.0, 'paid' => 120.0, 'decimal_places' => 2]),
            'an overpaid invoice is covered'
        );
    }

    /**
     * @param array<string, float|int> $summary
     */
    private function isCovered(array $summary): bool
    {
        $reflection = new ReflectionMethod(InvoiceLedgerService::class, 'isCovered');
        $reflection->setAccessible(true);

        return $reflection->invoke($this->service, $summary);
    }

    /**
     * The helpers under test are protected — they are internals of
     * recordManualPayment() that pro may override, not public API — so the
     * test reaches them by reflection rather than widening their visibility.
     *
     * @param mixed $argument
     */
    private function invoke(string $method, $argument)
    {
        $reflection = new ReflectionMethod(InvoiceLedgerService::class, $method);
        $reflection->setAccessible(true);

        return $reflection->invoke($this->service, $argument);
    }
}
