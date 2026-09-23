<?php

namespace BitApps\Crm\Services\Privacy;

/**
 * Suggested privacy-policy text shown under Settings → Privacy → Policy Guide.
 *
 * WordPress renders it as guidance for the site owner, who copies and adapts
 * it into their own policy. Paragraphs with class "privacy-policy-tutorial"
 * are notes to the owner and are not meant to be copied.
 */
class PrivacyPolicyContent
{
    public function render(): string
    {
        $paragraphs = [
            $this->buildTutorial(__('Bit CRM keeps the people and businesses you work with in your own WordPress database. The text below is a starting point. Change it so it describes what you really collect, why you are allowed to, and how long you keep it.', 'bit-crm-sales-marketing-automation')),

            $this->buildHeading(__('What we keep about you and why', 'bit-crm-sales-marketing-automation')),
            $this->buildParagraph(__('When you get in touch with us, become a customer, or are introduced to us, we create a record for you in our customer database. It holds your name, email address, phone number, postal address and your role at your company, along with the notes, tasks, calls, meetings, files and links our team saves while working with you. We use this to keep track of our conversations, to follow up on sales, to send you invoices and to stay in contact.', 'bit-crm-sales-marketing-automation')),
            $this->buildParagraph(__('If our team connects a mailbox to the database, the emails sent between that mailbox and your address are copied in as well, so your conversation history sits next to your record. This includes the subject, the message text, the sender and recipient details and the names of any attachments.', 'bit-crm-sales-marketing-automation')),

            $this->buildHeading(__('Who can see it', 'bit-crm-sales-marketing-automation')),
            $this->buildParagraph(__('Only the members of our team who have been given access to the customer database can see your record. If we send you a link to an invoice, anyone who has that link can open the invoice.', 'bit-crm-sales-marketing-automation')),

            $this->buildHeading(__('Where your information goes', 'bit-crm-sales-marketing-automation')),
            $this->buildParagraph(__('Emails and invoices we send you travel through our email provider. Emails we sync from a connected mailbox are fetched from that mail provider, for example Gmail or Zoho. If you pay an invoice online, the payment is handled by the payment provider shown on the invoice, and that provider receives your name, billing details and the amount. The pages we show you, such as a shared invoice, load their fonts from Google Fonts, which receives your IP address when the page loads.', 'bit-crm-sales-marketing-automation')),

            $this->buildHeading(__('How long we keep it', 'bit-crm-sales-marketing-automation')),
            $this->buildParagraph(__('We keep your record for as long as we are working together and for as long as the law requires afterwards. Invoices, and the records they rely on, are kept for the period that accounting and tax rules demand.', 'bit-crm-sales-marketing-automation')),

            $this->buildHeading(__('Your choices', 'bit-crm-sales-marketing-automation')),
            $this->buildParagraph(__('You can ask us for a copy of everything we hold about you, and you can ask us to delete it. When you ask us to delete, we remove your lead and contact records, everything saved on them, and the emails we stored from our conversations. If your record is tied to deals or invoices that we are required to keep, we strip your personal details from those records and keep only the anonymized business information.', 'bit-crm-sales-marketing-automation')),

            $this->buildTutorial(__('Bit CRM works with the built-in WordPress privacy tools. To handle a request, go to Tools → Export Personal Data or Tools → Erase Personal Data and enter the person\'s email address.', 'bit-crm-sales-marketing-automation')),
        ];

        return implode("\n", $paragraphs);
    }

    private function buildHeading(string $text): string
    {
        return '<h3>' . esc_html($text) . '</h3>';
    }

    private function buildParagraph(string $text): string
    {
        return '<p>' . esc_html($text) . '</p>';
    }

    private function buildTutorial(string $text): string
    {
        return '<p class="privacy-policy-tutorial">' . esc_html($text) . '</p>';
    }
}
