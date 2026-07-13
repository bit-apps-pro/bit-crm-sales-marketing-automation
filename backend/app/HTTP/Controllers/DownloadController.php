<?php

namespace BitApps\Crm\HTTP\Controllers;

use BitApps\Crm\Deps\BitApps\WPKit\Http\Request\Request;

class DownloadController
{
    public function downloadMedia(Request $request)
    {
        $mediaId = (int) $request['mediaId'];
        $fileName = sanitize_text_field($request['fileName']);

        if (empty($mediaId) || empty($fileName)) {
            $this->show404();
        }

        $filePath = $this->getFilePath($mediaId);

        header('Content-Type: application/force-download');
        header('Content-Type: application/octet-stream');
        header('Content-Type: application/download');
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
