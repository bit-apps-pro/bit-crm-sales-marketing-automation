<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\HTTP\Requests\Media\DownloadMediaRequest;

class DownloadController
{
    public function downloadMedia(DownloadMediaRequest $request)
    {
        $validated = $request->validated();

        $mediaId = (int) $validated['mediaId'];
        $fileName = sanitize_text_field($validated['fileName']);

        if ($mediaId <= 0 || empty($fileName)) {
            $this->show404();
        }

        $filePath = $this->getFilePath($mediaId);
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $fileName . '"');
        header('Content-Description: File Transfer');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Content-Length: ' . filesize($filePath));
        header('Content-Transfer-Encoding: binary ');
        flush();
        readfile($filePath); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile -- Streaming binary file to output

        exit();
    }

    private function getFilePath($mediaId)
    {
        $filePath = get_attached_file($mediaId);

        if (!is_readable($filePath)) {
            $this->show404();
        }

        return $filePath;
    }

    private function show404()
    {
        global $wp_query;
        $wp_query->set_404();
        status_header(404);
        get_template_part(404);

        exit();
    }
}
