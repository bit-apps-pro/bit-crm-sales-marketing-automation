<?php

namespace BitApps\Crm\Traits;

trait FormatPagination
{
    public function formatPagination(array $data, int $pageNo, int $perPage, int $total): array
    {
        $pages = ($perPage > 0) ? ceil($total / $perPage) : 0;

        return [
            'data'          => $data,
            'pages'         => $pages,
            'total'         => $total,
            'current_total' => \count($data),
            'current_page'  => $pageNo,
            'last_page'     => $pages,
            'per_page'      => $perPage,
        ];
    }
}
