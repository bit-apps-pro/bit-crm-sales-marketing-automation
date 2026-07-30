<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\HTTP\Requests\BitForm\CreateFormRequest;
use BitApps\Crm\HTTP\Requests\BitForm\FormsRequest;
use BitApps\Crm\HTTP\Requests\BitForm\ToggleFormStatusRequest;
use WP_Error;

final class BitFormIntegrationController
{
    public const CODE_BITFORM_ABSENT = 'bitform_absent';

    private const ALLOWED_TEMPLATE_SLUGS = ['contact_form'];

    private const FILTER_FORMS = 'bitform/api/crm_integrated_forms';

    private const FILTER_TOGGLE = 'bitform/api/toggle_form_status';

    private const FILTER_CREATE_URL = 'bitform/api/create_form_url';

    public function forms(FormsRequest $request)
    {
        $result = Hooks::applyFilter(self::FILTER_FORMS, null);

        if (is_wp_error($result)) {
            return $this->wpErrorResponse($result);
        }

        if ($result === null) {
            return $this->bitformAbsent();
        }

        return Response::success(
            [
                'forms'            => array_values((array) $result),
                'bitformProActive' => defined('BITFORMPRO_DIR_PATH'),
            ]
        );
    }

    public function toggleFormStatus(ToggleFormStatusRequest $request)
    {
        $validated = $request->validated();

        $status = (int) filter_var($validated['status'], FILTER_VALIDATE_BOOLEAN);

        $result = Hooks::applyFilter(self::FILTER_TOGGLE, null, (int) $validated['formId'], $status);

        if (is_wp_error($result)) {
            return $this->wpErrorResponse($result);
        }

        if ($result === null) {
            return $this->bitformAbsent();
        }

        if ($result !== true) {
            return Response::error(null)->message(__('Failed to update the form status!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success(null)->message(__('Form status updated successfully.', 'bit-crm-sales-marketing-automation'));
    }

    public function createForm(CreateFormRequest $request)
    {
        $validated = $request->validated();

        $args = ['title' => $validated['title']];

        if (!empty($validated['templateSlug'])
            && \in_array($validated['templateSlug'], self::ALLOWED_TEMPLATE_SLUGS, true)
        ) {
            $args['templateSlug'] = $validated['templateSlug'];
        }

        $config = [];

        if (!empty($validated['crm']['tagIds'])) {
            $config['tagIds'] = array_map('intval', $validated['crm']['tagIds']);
        }

        if (!empty($validated['crm']['newTagTitles'])) {
            $config['newTagTitles'] = $validated['crm']['newTagTitles'];
        }

        if (!empty($validated['crm']['fieldMap'])) {
            $config['field_map'] = $validated['crm']['fieldMap'];
        }

        $args['integration'] = ['type' => 'Bit CRM', 'name' => 'Bit CRM', 'config' => $config];

        if (!empty($validated['returnUrl'])) {
            // Same-origin is enforced on the Bit Form side; cross-host values are dropped.
            $args['returnUrl'] = $validated['returnUrl'];
        }

        if (isset($validated['closeAfterCreate'])
            && filter_var($validated['closeAfterCreate'], FILTER_VALIDATE_BOOLEAN)
        ) {
            $args['closeAfterCreate'] = true;
        }

        $result = Hooks::applyFilter(self::FILTER_CREATE_URL, null, $args);

        if (is_wp_error($result)) {
            return $this->wpErrorResponse($result);
        }

        if ($result === null) {
            return $this->bitformAbsent();
        }

        return Response::success((array) $result);
    }

    private function bitformAbsent()
    {
        return Response::error(null, 424)
            ->code(self::CODE_BITFORM_ABSENT)
            ->message(__('Bit Form is inactive or needs an update to support the CRM integration.', 'bit-crm-sales-marketing-automation'));
    }

    private function wpErrorResponse(WP_Error $error)
    {
        return Response::error($error->get_error_data())
            ->code($error->get_error_code())
            ->message($error->get_error_message());
    }
}
