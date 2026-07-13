<?php

namespace BitApps\Crm\Rules\BusinessSettings;

use BitApps\Crm\Deps\BitApps\WPValidator\Rule;

class MediaRule extends Rule
{
    private const MAX_SIZE_BYTES = 2 * 1024 * 1024;

    private $message = 'File size exceeds 2MB. Please choose a smaller file.';

    public function __construct($customMessage = null)
    {
        if ($customMessage) {
            $this->message = $customMessage;
        }
    }

    public function validate($value)
    {
        if (empty($value)) {
            return true;
        }

        $attachmentId = $this->resolveAttachmentId($value);

        if (!$attachmentId) {
            return false;
        }

        $filePath = get_attached_file($attachmentId);

        if (!$filePath || !file_exists($filePath)) {
            return false;
        }

        $size = filesize($filePath);
        if ($size === false) {
            return false;
        }

        return $size <= self::MAX_SIZE_BYTES;
    }

    public function message()
    {
        return $this->message;
    }

    private function resolveAttachmentId($value): false|int
    {
        // If it's numeric, treat it as an attachment ID directly
        if (is_numeric($value)) {
            $id = (int) $value;

            return get_post($id) ? $id : false;
        }

        // Otherwise treat it as a URL
        return attachment_url_to_postid($value) ?: false;
    }
}
