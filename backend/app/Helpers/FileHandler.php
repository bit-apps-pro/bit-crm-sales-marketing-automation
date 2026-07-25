<?php

namespace BitApps\Crm\Helpers;

use BitApps\Crm\Config;
use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;

class FileHandler
{
    public static function uploadFile(array $file, string $subDir = 'uploads')
    {
        if (
            !$file
            || !File::isUploaded($file['tmp_name'])
            || empty($file['name'])
        ) {
            return Response::error(__('No valid file uploaded', 'bit-crm-sales-marketing-automation'));
        }

        $uploadDir = trailingslashit(Config::get('UPLOAD_BASE_DIR') . '/' . trim($subDir, '/'));
        if (!File::isExist($uploadDir)) {
            wp_mkdir_p($uploadDir);
        }

        $fileName = sanitize_file_name($file['name']);
        $filePath = $uploadDir . $fileName;

        if (!File::move($file['tmp_name'], $filePath, true)) {
            return Response::error(__('Failed to upload file', 'bit-crm-sales-marketing-automation'));
        }

        if (!File::isExist($filePath)) {
            return Response::error(__('File not found after upload', 'bit-crm-sales-marketing-automation'));
        }

        return [$filePath, $fileName];
    }

    /**
     * Path of a plugin sub directory, relative to the uploads base directory.
     *
     * Stored paths stay relative to wp_upload_dir() so they remain valid when the
     * uploads directory lives outside ABSPATH (UPLOADS constant, relocated
     * WP_CONTENT_DIR, multisite). Resolve them with getAbsoluteUploadPath() for
     * filesystem access, or getUploadUrl() for a public URL.
     */
    public static function getRelativeUploadPath(string $subDir): string
    {
        return trailingslashit(trim($subDir, '/'));
    }

    /**
     * Resolve an uploads-relative path to an absolute filesystem path.
     */
    public static function getAbsoluteUploadPath(string $relativePath): string
    {
        return wp_normalize_path(
            trailingslashit(Config::get('UPLOAD_BASE_DIR')) . ltrim($relativePath, '/')
        );
    }

    /**
     * Resolve an uploads-relative path to a public URL.
     */
    public static function getUploadUrl(string $relativePath): string
    {
        return trailingslashit(Config::get('UPLOAD_BASE_URL')) . ltrim($relativePath, '/');
    }

    public static function readCsvChunk(string $path, int $offset, int $limit): array
    {
        $rows = [];

        if (!File::isReadable($path)) {
            return [];
        }

        if (($stream = File::open($path, File::READ)) !== false) {
            $header = File::readCsv($stream);
            if ($header === false) {
                File::close($stream);

                return [];
            }

            $currentOffset = 0;

            while (
                ($data = File::readCsv($stream)) !== false
                && \count($rows) < $limit
            ) {
                if ($currentOffset++ < $offset || \count($data) !== \count($header)) {
                    continue;
                }

                $rows[] = array_combine($header, $data);
            }

            File::close($stream);
        }

        return $rows;
    }

    public static function getCsvRecordCount(string $path): int
    {
        $count = 0;
        $path = wp_normalize_path($path);

        if (!File::isExist($path)) {
            return $count;
        }

        $stream = File::open($path, File::READ);
        if (!$stream) {
            return $count;
        }

        File::readCsv($stream);

        while (File::readCsv($stream) !== false) {
            ++$count;
        }

        File::close($stream);

        return $count;
    }

    /**
     * Check if the given file path is safe and valid to delete.
     */
    public static function isValidPath(string $path): bool
    {
        $uploadBase = realpath(Config::get('UPLOAD_BASE_DIR'));
        $realPath = realpath($path);

        return
            $realPath
            && File::isFile($realPath)
            && strpos($realPath, $uploadBase) === 0
            && File::isWriteable($realPath);
    }

    public static function isFileType(array $file, string $type)
    {
        $check = wp_check_filetype($file['name']);

        return $check['ext'] === $type;
    }
}
