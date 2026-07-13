<?php

namespace BitApps\Crm\Helpers;

if (!defined('ABSPATH')) {
    exit;
}

class Utility
{
    /**
     * Gets a value from an array using a path.
     *
     * @param array  $data the array to get the value from
     * @param string $path the path to the value
     *
     * @return mixed the value
     */
    public static function getValueFromPath($data, $path)
    {
        if (empty($data)) {
            return $data;
        }

        if (!\is_null($path) && $path !== '') {
            $keys = explode('.', $path);

            foreach ($keys as $key) {
                $data = \is_object($data) ? (array) $data : $data;

                if (\array_key_exists($key, $data)) {
                    $data = $data[$key];
                }
            }
        }

        return $data;
    }

    public static function formatResponseData($statusCode, $requestBody, $response, $message = null)
    {
        if ($statusCode >= 200 && $statusCode < 300) {
            return [
                'status'  => 'success',
                'message' => $message,
                'output'  => $response ?? [],
                'input'   => $requestBody ?? [],
            ];
        }

        return [
            'status'  => 'error',
            'message' => $message,
            'output'  => $response,
            'input'   => $requestBody,
        ];
    }

    /**
     * Checks if the given array is a multi-dimensional array.
     *
     * @param array $data
     *
     * @return bool whether the array is a multi-dimensional array
     */
    public static function isMultiDimensionArray($data)
    {
        if (!\is_array($data) || empty($data)) {
            return false;
        }

        $arrayValuesWithIntegerKeys = array_filter(
            $data,
            fn ($val, $key) => \is_array($val) && \is_int($key),
            ARRAY_FILTER_USE_BOTH
        );

        return \count($arrayValuesWithIntegerKeys) === \count($data);
    }
}
