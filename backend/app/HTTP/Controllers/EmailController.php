<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Config;
use BitApps\Crm\Constants\CommonConstant;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;
use BitApps\Crm\Helpers\CaseConverter;
use BitApps\Crm\HTTP\Requests\Email\IndexRequest;
use BitApps\Crm\HTTP\Requests\Email\SendRequest;
use BitApps\Crm\HTTP\Requests\Email\ViewRequest;
use BitApps\Crm\Model\Contact;
use BitApps\Crm\Model\Deal;
use BitApps\Crm\Model\Email;
use BitApps\Crm\Model\Lead;
use BitApps\Crm\Services\EmailService;
use Throwable;

final class EmailController
{
    public const DEFAULT_PER_PAGE = 10;

    private $phpMailer;

    public function index(IndexRequest $request)
    {
        $validated = $request->validated();
        $page = !empty($validated['page']) ? $validated['page'] : 1;
        $perPage = !empty($validated['perPage']) ? $validated['perPage'] : self::DEFAULT_PER_PAGE;
        $sortby = !empty($validated['sortBy']) ? CaseConverter::camelToSnake($validated['sortBy']) : 'email_date';
        $sortOrder = !empty($validated['sortOrder']) ? $validated['sortOrder'] : 'desc';
        $imapSettingsTable = Config::withDBPrefix('imap_settings');
        $wpUsersTable = Config::get('WP_DB_PREFIX') . 'users';

        switch ($validated['module']) {
            case Lead::MODULE_NAME:
                $entityTable = Config::withDBPrefix('leads');
                $entityNameExpr = "CONCAT_WS(' ', first_name, last_name)";

                break;

            case Contact::MODULE_NAME:
                $entityTable = Config::withDBPrefix('contacts');
                $entityNameExpr = "CONCAT_WS(' ', first_name, last_name)";

                break;

            case Deal::MODULE_NAME:
                $entityTable = Config::withDBPrefix('deals');
                $entityNameExpr = 'name';

                break;

            default:
                $entityTable = null;
                $entityNameExpr = "''";
        }

        $emailsQuery = Email::select(['id', 'email_uid', 'entity_email', 'email_date', 'subject', 'email_direction', 'sent_from'])
            ->selectRaw("(SELECT display_name FROM {$wpUsersTable} WHERE ID = created_by) AS sender_name")
            ->selectRaw("(SELECT username FROM {$imapSettingsTable} WHERE id = %d) AS imap_username", [$validated['imap_id']])
            ->when(
                $entityTable !== null,
                function ($query) use ($entityTable, $entityNameExpr, $validated) {
                    $query->selectRaw(
                        "(SELECT {$entityNameExpr} FROM {$entityTable} WHERE email = %s AND is_trash = 0 LIMIT 1) AS entity_name",
                        [$validated['entity_email']]
                    );
                },
                function ($query) {
                    $query->selectRaw("'' AS entity_name");
                }
            )
            ->where('entity_email', $validated['entity_email'])
            ->when(
                !empty($validated['imap_id']) && $validated['source'] === 'all',
                function ($query) use ($validated) {
                    $query->where(
                        function ($query) use ($validated) {
                            $query->where('imap_id', $validated['imap_id'])
                                ->orWhere(
                                    function ($query) {
                                        $query->whereNull('imap_id')
                                            ->where('sent_from', Config::SLUG);
                                    }
                                );
                        }
                    );
                },
                function ($query) {
                    $query->where('sent_from', Config::SLUG);
                }
            );

        if ($searchTerm = $validated['searchTerm']) {
            $emailsQuery->where(
                function ($query) use ($searchTerm) {
                    $query
                        ->where('subject', 'LIKE', '%' . $searchTerm . '%')
                        ->orWhere('body', 'LIKE', '%' . $searchTerm . '%');
                }
            );
        }

        if ($sortOrder === 'desc') {
            $emailsQuery->orderBy($sortby)->desc();
        } else {
            $emailsQuery->orderBy($sortby)->asc();
        }

        try {
            $emails = $emailsQuery->paginate($page, $perPage);
        } catch (Throwable $th) {
            return Response::error(__('Failed to fetch emails!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success($emails);
    }

    public function view(ViewRequest $request)
    {
        $validated = $request->validated();

        $email = new Email($validated['id']);

        if (!$email->exists()) {
            return Response::error(__('Email not found.', 'bit-crm-sales-marketing-automation'));
        }

        if (!empty($email->body)) {
            return Response::success($email);
        }

        $emailBody = EmailService::getEmailBody($email->toArray());

        if (!$emailBody) {
            return Response::error(__('Failed to fetch email body!', 'bit-crm-sales-marketing-automation'));
        }

        $email->body = $emailBody;

        try {
            $email->save();
        } catch (Throwable $th) {
            return Response::error(__('Failed to save email body!', 'bit-crm-sales-marketing-automation'));
        }

        return Response::success($email);
    }

    public function send(SendRequest $request)
    {
        $validated = $request->validated();
        $emailService = new EmailService();
        $formattedAttachments = $emailService->processAttachments($validated['attachments'] ?? []);
        $message = $emailService->formatMessage($validated['message'], $validated['entity_id'], $validated['module']);
        $headers = ['Content-Type: text/html; charset=UTF-8'];

        Hooks::addAction(
            'phpmailer_init',
            function ($phpmailer) {
                $this->phpMailer = $phpmailer;
            }
        );

        $sent = wp_mail($validated['entity_email'], $validated['subject'], $message, $headers, $formattedAttachments);

        if (!$sent) {
            return Response::error(__('Failed to send email.', 'bit-crm-sales-marketing-automation'));
        }

        $messageId = $this->getMessageId();

        if (!$messageId) {
            return Response::error(__('Failed to retrieve message ID after sending email.', 'bit-crm-sales-marketing-automation'));
        }

        Email::insert(
            [
                'message_id'      => $messageId,
                'entity_email'    => $validated['entity_email'],
                'email_date'      => current_time('mysql'),
                'subject'         => $validated['subject'],
                'body'            => $message,
                'email_direction' => CommonConstant::EMAIL_DIRECTION_SENT,
                'sent_from'       => Config::SLUG,
                'attachments'     => $validated['attachments'] ?? [],
                'created_by'      => get_current_user_id(),
            ]
        );

        return Response::success(__('Email sent successfully.', 'bit-crm-sales-marketing-automation'));
    }

    private function getMessageId(): false|string
    {
        if ($this->phpMailer && !empty($this->phpMailer->getLastMessageID())) {
            return trim($this->phpMailer->getLastMessageID(), '<>');
        }

        return false;
    }
}
