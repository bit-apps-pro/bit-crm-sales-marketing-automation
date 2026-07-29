<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Model\Contact;
use BitApps\Crm\src\StaticData\CurrencyHelper;

class WooCommerceContactSyncService
{
    public function syncOrder($orderOrId): bool
    {
        if (!$this->isPluginActive()) {
            return false;
        }

        $settings = SettingService::getSettingsValue(IntegrationSettingsService::SETTINGS_KEYS['WOOCOMMERCE_INTEGRATION_SETTINGS']);

        if (!($settings['sync_enabled'] ?? false)) {
            return false;
        }

        $order = is_numeric($orderOrId) ? $this->getWcOrder($orderOrId) : $orderOrId;

        if (!$order) {
            return false;
        }

        $email = $this->resolveEmail($order);

        if (empty($email)) {
            return false;
        }

        $customerId = (int) $order->get_customer_id();
        $data = $this->mapOrderToContactFields($order, $email, $customerId > 0 ? $customerId : null);
        $companyName = $order->get_billing_company();

        if (!empty($companyName)) {
            $companyId = $this->resolveCompanyId($companyName);
            if ($companyId !== null) {
                $data['company_id'] = $companyId;
            }
        }

        $existing = Contact::findOne(['email' => $email]);

        if ($existing) {
            $filtered = array_filter($data, fn ($v) => $v !== '');
            $filtered['updated_by'] = 0;
            $existing->update($filtered);
            $contactId = $existing->id;
        } else {
            if (empty($data['last_name'])) {
                return false;
            }

            $data['email'] = $email;
            $data['lead_source'] = 'woocommerce';
            $data['created_from'] = 'woocommerce';
            $data['created_by'] = 0;
            $data['currency'] = CurrencyHelper::getHomeCurrency();
            $contact = Contact::insert($data);
            $contactId = $contact->id;
        }

        if (empty($contactId)) {
            return false;
        }

        $tags = $this->buildTags($order, $settings);

        if (!empty($tags)) {
            (new ContactService())->storeAndAttachTags($contactId, [], $tags);
        }

        return true;
    }

    private function resolveEmail($order): ?string
    {
        $customerId = (int) $order->get_customer_id();
        if ($customerId > 0) {
            $userData = get_userdata($customerId);
            if ($userData && !empty($userData->user_email)) {
                return $userData->user_email;
            }
        }

        $billingEmail = $order->get_billing_email();

        return !empty($billingEmail) ? $billingEmail : null;
    }

    private function mapOrderToContactFields($order, string $resolvedEmail, ?int $registeredUserId): array
    {
        $data = [
            'first_name'              => $order->get_billing_first_name(),
            'last_name'               => $order->get_billing_last_name(),
            'phone'                   => $order->get_billing_phone(),
            'billing_address_line_1'  => $order->get_billing_address_1(),
            'billing_address_line_2'  => $order->get_billing_address_2(),
            'billing_city'            => $order->get_billing_city(),
            'billing_state'           => $order->get_billing_state(),
            'billing_zip'             => $order->get_billing_postcode(),
            'billing_country'         => $order->get_billing_country(),
            'shipping_address_line_1' => $order->get_shipping_address_1(),
            'shipping_address_line_2' => $order->get_shipping_address_2(),
            'shipping_city'           => $order->get_shipping_city(),
            'shipping_state'          => $order->get_shipping_state(),
            'shipping_zip'            => $order->get_shipping_postcode(),
            'shipping_country'        => $order->get_shipping_country()
        ];

        if (\is_null($registeredUserId)) {
            return $data;
        }

        $billingEmail = $order->get_billing_email();

        if (!empty($billingEmail) && $billingEmail !== $resolvedEmail) {
            $data['secondary_email'] = $billingEmail;
        }

        if ($registeredUserId !== null && (empty($data['first_name']) || empty($data['last_name']))) {
            $userData = get_userdata($registeredUserId);

            if ($userData) {
                if (empty($data['first_name'])) {
                    $data['first_name'] = $userData->first_name;
                }

                if (empty($data['last_name'])) {
                    $data['last_name'] = $userData->last_name;
                }
            }
        }

        return $data;
    }

    private function resolveCompanyId(string $companyName): ?int
    {
        $company = (new CompanyService())->findOrCreateByName($companyName);

        return !empty($company['id']) ? (int) $company['id'] : null;
    }

    private function buildTags($order, array $settings): array
    {
        $tags = ['WooCommerce'];

        if ($settings['tag_contact'] ?? true) {
            $prefix = ($settings['use_product_tag_prefix'] ?? false) ? ($settings['product_tag_prefix'] ?? '') : '';
            foreach ($order->get_items() as $item) {
                $name = $item->get_name();
                if (!empty($name)) {
                    $tags[] = $prefix . $name;
                }
            }
        }

        if ($settings['include_coupon_as_tag'] ?? true) {
            $prefix = ($settings['use_coupon_tag_prefix'] ?? true) ? ($settings['coupon_tag_prefix'] ?? 'Coupon: ') : '';
            foreach ($order->get_coupon_codes() as $code) {
                if (!empty($code)) {
                    $tags[] = $prefix . $code;
                }
            }
        }

        return $tags;
    }

    private function getWcOrder(int $orderId)
    {
        if (\function_exists('wc_get_order')) {
            return wc_get_order($orderId);
        }

        return false;
    }

    /**
     * Check if WooCommerce plugin is active.
     *
     * @return bool true if WooCommerce is active, false otherwise
     */
    private function isPluginActive(): bool
    {
        return class_exists('WooCommerce');
    }
}
