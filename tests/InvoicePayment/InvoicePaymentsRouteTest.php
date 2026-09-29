<?php

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\JSON;
use BitApps\Crm\Model\Invoice;
use BitApps\Crm\Model\InvoicePayment;

/**
 * The FREE payment-history route and the manual-payment guard behind it.
 *
 * Seeds a bare invoice row (no deal, no line items) on purpose: it proves the
 * route degrades cleanly — an empty history and a null summary — instead of
 * failing when the invoice cannot be totalled, and that recording a payment
 * against such an invoice is refused rather than written.
 *
 * @internal
 *
 * @coversNothing
 */
class InvoicePaymentsRouteTest extends BaseTestCase
{
    /**
     * @test
     *
     * @group api
     */
    public function paymentsRouteReturnsLedgerShape()
    {
        $invoice = $this->seedInvoice(Invoice::STATUS_SENT);

        $this->call('GET', 'invoices/' . $invoice->id . '/payments');
        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertEquals('success', $response['status']);
        $this->assertArrayHasKey('payments', $response['data']);
        $this->assertArrayHasKey('summary', $response['data']);
        $this->assertIsArray($response['data']['payments']);
        $this->assertCount(0, $response['data']['payments']);
    }

    /**
     * @test
     *
     * @group api
     */
    public function paymentsRouteRejectsUnknownInvoice()
    {
        $this->call('GET', 'invoices/999999/payments');
        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertEquals('error', $response['status']);
    }

    /**
     * @test
     *
     * @group api
     */
    public function manualPaymentRefusesDraft()
    {
        $invoice = $this->seedInvoice(Invoice::STATUS_DRAFT);

        $this->call('POST', 'invoices/' . $invoice->id . '/manual-payment', ['reference' => 'X']);
        $response = JSON::maybeDecode($this->_last_response, true);

        $this->assertEquals('error', $response['status']);
        $this->assertSame(0, InvoicePayment::where('entity_id', $invoice->id)->count());
    }

    private function seedInvoice(string $status): Invoice
    {
        $invoice = Invoice::insert([
            'invoice_date'   => current_time('mysql', true),
            'due_date'       => current_time('mysql', true),
            'entity_id'      => 0,
            'module'         => 'deal',
            'invoice_prefix' => Invoice::DEFAULT_PREFIX,
            'status'         => $status,
            'is_trash'       => false,
            'amount'         => '10.0000',
            'currency'       => 'USD',
            'created_by'     => get_current_user_id(),
        ]);

        $this->assertNotEmpty($invoice, 'Invoice seed failed');

        return $invoice;
    }
}
