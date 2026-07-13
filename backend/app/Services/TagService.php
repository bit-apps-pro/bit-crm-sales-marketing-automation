<?php

namespace BitApps\Crm\Services;

use BitApps\Crm\Deps\BitApps\WPKit\Helpers\Slug;
use BitApps\Crm\Deps\BitApps\WPKit\Hooks\Hooks;
use BitApps\Crm\Model\Tag;
use Throwable;

class TagService
{
    public static function store($data)
    {
        if (!ModuleService::isValidModule($data['module'])) {
            return false;
        }

        $data['slug'] = Slug::generate($data['title']);
        $data['created_by'] = get_current_user_id();

        try {
            $tag = Tag::insert($data);
        } catch (Throwable $th) {
            return false;
        }

        Hooks::doAction('bit_crm/tag_created', $tag);

        return $tag;
    }
}
