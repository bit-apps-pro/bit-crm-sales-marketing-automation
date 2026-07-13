<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Factories\EntityFactory;
use BitApps\Crm\Utils\Logger;
use DOMDocument;
use DOMElement;
use DOMXPath;
use Throwable;

class EntityFieldService
{
    /**
     * Get entity data based on the module and entity ID.
     *
     * @param string $module   The module name
     * @param int    $entityId The entity ID
     *
     * @return array|bool The entity data or false if the module is invalid
     */
    public static function getEntityData($module, $entityId): array|bool
    {
        if (empty($module) || empty($entityId)) {
            return false;
        }

        try {
            return EntityFactory::module($module)->findById($entityId);
        } catch (Throwable $th) {
            Logger::error($th);

            return false;
        }
    }

    /**
     * Render fields in the content with the data provided.
     *
     * This method replaces placeholders in the content with actual values from the data array.
     * The placeholders are in the format #{key}, where 'key' corresponds to the keys in the data array.
     * If a key in the data array is an array itself, it will be converted to a comma-separated string.
     * If no replacements are made, the method returns null.
     *
     * @param string $content The content with placeholders
     * @param array  $data    The data to replace the placeholders
     *
     * @return null|string The content with replaced values or null if no replacements were made
     */
    public static function renderFields($content, $data): ?string
    {
        if (empty($content)) {
            return $content;
        }

        return preg_replace_callback(
            '/#\{([\w-]+)\}/',
            function ($matches) use ($data) {
                $key = $matches[1];

                if (\is_array($data) && \array_key_exists($key, $data)) {
                    return \is_array($data[$key]) ? implode(', ', $data[$key]) : $data[$key];
                }
            },
            $content
        );
    }

    /**
     * Render fields in HTML content with the provided data.
     *
     * This method replaces <span> elements with class "mention" and a data-id attribute
     * with the corresponding value from the data array. The data-id should be in the format {key}.
     *
     * @param string $content The HTML content with <span> elements
     * @param array  $data    The data to replace the placeholders
     *
     * @return null|string The modified HTML content or null if no replacements were made
     */
    public static function renderFieldsInHtml($content, $data): ?string
    {
        if (empty($content) || empty($data)) {
            return $content;
        }

        $doc = new DOMDocument();
        @$doc->loadHTML(mb_convert_encoding($content, 'HTML-ENTITIES', 'UTF-8'));

        $xpath = new DOMXPath($doc);
        $spans = $xpath->query('//span[contains(@class, "mention")]');

        foreach ($spans as $span) {
            if ($span instanceof DOMElement) {
                $dataId = $span->getAttribute('data-id');

                if (empty($dataId)) {
                    continue;
                }

                $dataId = trim($dataId, '{}');
                $replacement = $data[$dataId] ?? '';
                $newSpan = $doc->createElement('span', htmlspecialchars($replacement));
                $span->parentNode->replaceChild($newSpan, $span);
            }
        }

        // Extract the body inner HTML
        $body = $doc->getElementsByTagName('body')->item(0);
        $innerHTML = '';
        foreach ($body->childNodes as $child) {
            $innerHTML .= $doc->saveHTML($child);
        }

        return $innerHTML;
    }
}
