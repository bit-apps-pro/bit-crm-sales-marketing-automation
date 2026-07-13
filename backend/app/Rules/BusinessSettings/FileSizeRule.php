<?php

namespace BitApps\Crm\Rules\BusinessSettings;

use BitApps\Crm\Deps\BitApps\WPValidator\Rule;

class FileSizeRule extends Rule
{
    private const DEFAULT_MAX_SIZE_MB = 2;

    private int $maxSizeBytes;

    private string $message;

    public function __construct(int $maxSizeMB = self::DEFAULT_MAX_SIZE_MB, ?string $customMessage = null)
    {
        $this->maxSizeBytes = $maxSizeMB * 1024 * 1024;
        $this->message = $customMessage ?? "File size exceeds {$maxSizeMB}MB. Please choose a smaller file.";
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

        $meta = wp_get_attachment_metadata($attachmentId);

        if (!$meta || !isset($meta['filesize'])) {
            return false;
        }

        return $meta['filesize'] <= $this->maxSizeBytes;
    }

    public function message()
    {
        return $this->message;
    }

    private function resolveAttachmentId($value): false|int
    {
        if (is_numeric($value)) {
            $id = (int) $value;

            return get_post($id) ? $id : false;
        }

        return attachment_url_to_postid($value) ?: false;
    }
}
