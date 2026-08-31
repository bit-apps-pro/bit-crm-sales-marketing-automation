<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;
use BitApps\Crm\Factories\EntityFactory;
use BitApps\Crm\HTTP\Requests\Email\SendRequest;
use BitApps\Crm\Model\Email;
use BitApps\Crm\Model\ImapSetting;
use BitApps\Crm\src\Imap\Messages;
use BitApps\Crm\Utils\Logger;
use Throwable;
use WP_Error;

class EmailService
{
    /**
     * @param string[] $filePaths server-generated attachments (e.g. invoice PDFs) that are sent but not stored
     */
    public function send(array|Request $data, array $filePaths = []): array
    {
        $rules = (new SendRequest())->rules();
        $validated = CommonService::resolveValidatedData($data, $rules);

        if (isset($validated['errors'])) {
            return ['success' => false, 'errors' => $this->flattenErrors($validated['errors'])];
        }

        $primaryEmail = $this->normalizeAddress($validated['entity_email']);
        $cc = $this->normalizeAddresses($validated['cc'] ?? [], [$primaryEmail]);
        $bcc = $this->normalizeAddresses($validated['bcc'] ?? [], array_merge([$primaryEmail], $cc));

        $formattedAttachments = array_merge($this->processAttachments($validated['attachments'] ?? []), $filePaths);
        $parent = $this->resolveParent($validated['reply_to_id'] ?? null, $validated['entity_email']);

        $message = $this->formatMessage($validated['message'], $validated['entity_id'], $validated['module']);

        if ($parent) {
            // The quote is a courtesy; nothing that goes wrong building it may block the send.
            try {
                $message .= $this->quoteParent($parent);
            } catch (Throwable $th) {
                Logger::error('Could not quote parent email: ' . $th->getMessage(), ['email_id' => $parent->id]);
            }
        }

        $headers = array_merge(['Content-Type: text/html; charset=UTF-8'], $this->getThreadingHeaders($parent));

        if (!empty($cc)) {
            $headers[] = 'Cc: ' . implode(', ', $cc);
        }

        if (!empty($bcc)) {
            $headers[] = 'Bcc: ' . implode(', ', $bcc);
        }

        $phpMailer = null;
        $mailError = null;

        Hooks::addAction(
            'phpmailer_init',
            function ($mailer) use (&$phpMailer) {
                $phpMailer = $mailer;
            }
        );

        /*
         * wp_mail() only reports false. The reason -- no transport configured,
         * SMTP auth rejected, a recipient the server refused -- arrives on
         * wp_mail_failed and is otherwise discarded, which makes a
         * misconfigured site indistinguishable from a bad request.
         */
        Hooks::addAction(
            'wp_mail_failed',
            function ($error) use (&$mailError) {
                $mailError = $error instanceof WP_Error ? $error->get_error_message() : null;
            }
        );

        $sent = wp_mail($validated['entity_email'], $validated['subject'], $message, $headers, $formattedAttachments);

        if (!$sent) {
            $reason = !empty($mailError)
                ? $mailError
                : __('the site has no working mail transport.', 'bit-crm-sales-marketing-automation');

            Logger::error('wp_mail failed: ' . $reason, ['to' => $validated['entity_email']]);

            return [
                'success' => false,
                'errors'  => [
                    \sprintf(
                        // translators: %s: the underlying mail error reported by WordPress.
                        __('Failed to send email: %s', 'bit-crm-sales-marketing-automation'),
                        $reason
                    ),
                ],
            ];
        }

        $messageId = $this->getMessageId($phpMailer);

        if (!$messageId) {
            return ['success' => false, 'errors' => [__('Failed to retrieve message ID after sending email.', 'bit-crm-sales-marketing-automation')]];
        }

        $email = Email::insert(
            [
                'message_id'      => $messageId,
                'entity_email'    => $validated['entity_email'],
                'email_date'      => current_time('mysql'),
                'subject'         => $validated['subject'],
                'body'            => $message,
                'email_direction' => CommonConstant::EMAIL_DIRECTION_SENT,
                'from_email'      => $this->normalizeAddress((string) ($phpMailer->From ?? '')),
                'to_emails'       => [$primaryEmail],
                'cc'              => $cc,
                'bcc'             => $bcc,
                'sent_from'       => Config::SLUG,
                'attachments'     => $validated['attachments'] ?? [],
                'created_by'      => get_current_user_id(),
            ]
        );

        return ['success' => true, 'data' => $email];
    }

    public static function getEmailBody($emailData)
    {
        $imapMessages = new Messages($emailData['entity_email'], $emailData['imap_id']);

        if ($emailData['email_direction'] === CommonConstant::EMAIL_DIRECTION_RECEIVED) {
            $msg = $imapMessages->getReceivedMessageByUid($emailData['email_uid']);
        } else {
            $msg = $imapMessages->getSentMessageByUid($emailData['email_uid']);
        }

        if (empty($msg) || (\is_array($msg) && isset($msg['success']) && !$msg['success'])) {
            return false;
        }

        if ($msg->hasHTMLBody()) {
            $body = $msg->getHTMLBody();
        } else {
            $body = $msg->getTextBody();
        }

        return $body;
    }

    public function processAttachments(array $attachments)
    {
        $filePaths = [];

        foreach ($attachments as $attachment) {
            if (empty($attachment['media_id'])) {
                continue;
            }

            $filePath = get_attached_file($attachment['media_id']);

            if ($filePath && file_exists($filePath)) {
                $filePaths[] = $filePath;
            }
        }

        return $filePaths;
    }

    public function formatMessage($message, $entityId, $module)
    {
        if (empty($message) || empty($entityId) || empty($module)) {
            return $message;
        }

        try {
            $entityData = EntityFactory::module($module)->findById($entityId);
        } catch (Throwable $th) {
            return $message;
        }

        return EntityFieldService::renderFieldsInHtml($message, $entityData);
    }

    /**
     * The parent is resolved scoped to the address being written to: the id is
     * caller-supplied and SendRequest only checks module-view capability, so an
     * unscoped read would let any stored mail -- including another contact's --
     * be named as the parent of (and quoted into) an outgoing message.
     */
    private function resolveParent(?int $replyToId, string $entityEmail): ?Email
    {
        if (empty($replyToId)) {
            return null;
        }

        $parent = Email::findOne(['id' => $replyToId, 'entity_email' => $entityEmail]);

        return $parent ?: null;
    }

    /**
     * In-Reply-To and References are what make a reply thread in the
     * recipient's client; without them it arrives as an unrelated mail that
     * merely starts with "Re:".
     *
     * The stored id is remote input on IMAP-synced rows. PHPMailer refuses a
     * header value containing CRLF by throwing, which would fail the whole
     * send, so it is stripped here: a malformed id costs threading, not the
     * message. Angle brackets are re-added because stored ids arrive without
     * them -- ours trimmed on capture, webklex's stripped on sync.
     *
     * LIMITATION: RFC 5322 wants References to be the parent's own References
     * chain plus its Message-ID. That chain is not stored, so this is depth-1 --
     * the first reply threads everywhere, later ones may split in strict
     * clients. Persisting in_reply_to/references on the row is what fixes it.
     *
     * @return string[] empty unless this is a reply to a resolvable parent
     */
    private function getThreadingHeaders(?Email $parent): array
    {
        if (!$parent || empty($parent->message_id)) {
            return [];
        }

        $messageId = trim(str_replace(["\r", "\n"], '', (string) $parent->message_id), '<> ');

        if ($messageId === '') {
            return [];
        }

        return [
            'In-Reply-To: <' . $messageId . '>',
            'References: <' . $messageId . '>',
        ];
    }

    /**
     * Quote the parent below the reply the way a mail client would.
     *
     * Quoting is a composer concern, not a transport one: wp_mail() and every
     * SMTP plugin behind it (Bit SMTP, Fluent SMTP, ...) send the body as
     * given and know nothing about the parent, so this is the only place a
     * quote can come from and there is no double-quoting to guard against.
     * Replying to a reply nests quotes, which is what every client produces.
     *
     * The markup is client-neutral: a plain blockquote with inline styles and
     * an "On <date>, <sender> wrote:" line renders the same in every client
     * (Gmail, Outlook, Zoho, Yahoo, Apple Mail, Thunderbird, ...). The extra
     * class/type attributes are hints those clients ignore when unknown and
     * use when recognised -- gmail_quote makes Gmail collapse the quote behind
     * its "..." toggle, type=cite makes Apple Mail / Thunderbird style it as a
     * citation. No client collapses other clients' formats, so the rest show
     * it expanded, as they would for any quote.
     *
     * @return string empty when the parent has no retrievable body -- a
     *                missing quote must never fail the send
     */
    private function quoteParent(Email $parent): string
    {
        $body = $this->sanitizeQuotedBody($this->getParentBody($parent));

        if ($body === '') {
            return '';
        }

        $date = mysql2date(get_option('date_format') . ', ' . get_option('time_format'), (string) $parent->email_date, true);
        $from = (string) ($parent->from_email ?: $this->guessSender($parent));

        $attribution = $from !== ''
            // translators: 1: date and time the quoted email was sent, 2: sender's email address.
            ? \sprintf(__('On %1$s, %2$s wrote:', 'bit-crm-sales-marketing-automation'), $date, $from)
            // translators: %s: date and time the quoted email was sent.
            : \sprintf(__('On %s:', 'bit-crm-sales-marketing-automation'), $date);

        return '<br><br><div class="gmail_quote">'
            . '<div class="gmail_attr">' . esc_html($attribution) . '</div>'
            . '<blockquote type="cite" class="gmail_quote" style="margin:0 0 0 .8ex;border-left:1px solid #ccc;padding-left:1ex">'
            . $body
            . '</blockquote></div>';
    }

    /**
     * Rows synced before db 1.0.3 have no from_email; the email view infers
     * the sender from the direction for them, and the quote follows suit.
     */
    private function guessSender(Email $parent): string
    {
        if ($parent->email_direction === CommonConstant::EMAIL_DIRECTION_RECEIVED) {
            return (string) $parent->entity_email;
        }

        $mailbox = !empty($parent->imap_id) ? ImapSetting::findOne(['id' => $parent->imap_id]) : null;

        return $mailbox ? (string) $mailbox->username : '';
    }

    /**
     * The Reply action lives in the email view, whose endpoint persists the
     * body before it can be replied to, so the stored body is the normal case.
     * The IMAP fallback covers rows synced but never opened.
     */
    private function getParentBody(Email $parent): string
    {
        if (!empty($parent->body)) {
            return (string) $parent->body;
        }

        if (empty($parent->email_uid) || empty($parent->imap_id)) {
            return '';
        }

        try {
            $body = self::getEmailBody($parent->toArray());
        } catch (Throwable $th) {
            Logger::error('Could not fetch parent body for quoting: ' . $th->getMessage(), ['email_id' => $parent->id]);

            return '';
        }

        return \is_string($body) ? $body : '';
    }

    /**
     * The parent body is untrusted HTML from an external sender, about to be
     * embedded in a message we sign as ours.
     *
     * wp_kses_post is the same filter SendRequest applies to the composed
     * message, but it only drops disallowed tags and keeps their text -- so
     * head/style/script blocks are removed whole first, or their CSS and JS
     * would surface as visible text in the quote. Inline cid: images point at
     * MIME parts of the parent that are not attached to this message and
     * would render broken.
     */
    private function sanitizeQuotedBody(string $body): string
    {
        $body = trim($body);

        if ($body === '') {
            return '';
        }

        // A stray "<" in prose (3 < 5) is not markup; an element or comment is.
        if (!preg_match('#<(?:[a-z][a-z0-9]*\b|/[a-z]|!--)#i', $body)) {
            return '<div style="white-space:pre-wrap">' . nl2br(esc_html($body)) . '</div>';
        }

        $body = (string) preg_replace('#<(head|style|script|title)\b[^>]*>.*?</\1\s*>#is', '', $body);
        $body = (string) preg_replace('#<img\b[^>]*\bsrc\s*=\s*(["\']?)cid:[^>]*>#i', '', $body);

        return trim(wp_kses_post($body));
    }

    /**
     * Clean a submitted list of addresses before it becomes a mail header.
     *
     * @param string[] $addresses
     * @param string[] $exclude   addresses already covered by another header
     *
     * @return string[] deduplicated, lowercased, syntactically valid addresses
     */
    private function normalizeAddresses(array $addresses, array $exclude = []): array
    {
        $normalized = [];

        foreach ($addresses as $address) {
            if (!\is_string($address)) {
                continue;
            }

            $address = $this->normalizeAddress($address);

            if ($address === '' || !is_email($address) || \in_array($address, $exclude, true)) {
                continue;
            }

            $normalized[$address] = true;
        }

        return array_keys($normalized);
    }

    /**
     * The validator reports failures as a map keyed by field name, while every
     * other failure here is a flat list -- and all four callers read
     * $result['errors'][0]. Flattening at the edge keeps that read honest
     * instead of handing them a null.
     *
     * @param mixed $errors
     *
     * @return string[]
     */
    private function flattenErrors($errors): array
    {
        if (\is_string($errors)) {
            return [$errors];
        }

        if (!\is_array($errors)) {
            return [__('Failed to send email.', 'bit-crm-sales-marketing-automation')];
        }

        $messages = [];

        foreach ($errors as $field => $error) {
            $text = \is_array($error) ? implode(' ', array_map('strval', $error)) : (string) $error;

            $messages[] = \is_string($field) ? $field . ': ' . $text : $text;
        }

        return $messages;
    }

    private function normalizeAddress(string $address): string
    {
        return strtolower(trim($address));
    }

    private function getMessageId($phpMailer): false|string
    {
        if ($phpMailer && !empty($phpMailer->getLastMessageID())) {
            return trim($phpMailer->getLastMessageID(), '<>');
        }

        return false;
    }
}
