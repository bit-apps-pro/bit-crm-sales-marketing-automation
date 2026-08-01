<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Invoice;

/**
 * Owns the invoice share token and the public (no-login) share URL.
 *
 * The token is the sole credential for the public invoice surface — the
 * shareable page, the token-guarded REST endpoints and the PDF download all
 * authorize against it. Kept apart from the pro InvoicePaymentService so the
 * public page can validate tokens without pulling in the payment machinery.
 */
class InvoiceShareTokenService
{
    /**
     * Pro / the client portal can retarget share links through this filter.
     */
    public const SHARE_URL_FILTER = 'bit_crm/invoice_share_url';

    /**
     * Query-param name carrying the share token on the public page URL. The
     * generator (this class) and the consumer (InvoicePublicPageService) must
     * agree on it forever.
     */
    public const TOKEN_QUERY_PARAM = 'token';

    /**
     * Returns the invoice share token, generating and persisting one when missing.
     */
    public function ensureToken(Invoice $invoice): string
    {
        if (!empty($invoice->token)) {
            return $invoice->token;
        }

        $token = bin2hex(random_bytes(20));
        $invoice->update(['token' => $token]);

        return $token;
    }

    public function isValidToken(Invoice $invoice, $token): bool
    {
        return !empty($invoice->token)
            && \is_string($token)
            && $token !== ''
            && hash_equals((string) $invoice->token, $token);
    }

    /**
     * Public (no-login) invoice page URL for a shared invoice.
     */
    public function getPublicInvoiceUrl(Invoice $invoice): string
    {
        $url = add_query_arg(
            [
                'id'                    => (int) $invoice->id,
                self::TOKEN_QUERY_PARAM => $this->ensureToken($invoice),
            ],
            home_url('/' . InvoicePublicPageService::PATH)
        );

        return (string) Hooks::applyFilter(self::SHARE_URL_FILTER, $url, $invoice);
    }
}
