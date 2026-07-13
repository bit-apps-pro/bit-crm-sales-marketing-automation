<?php

namespace BitApps\Crm\HTTP\Middleware;

// Prevent direct script access
if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Crm\Deps\BitApps\WPKit\Http\Response;

final class LoggedInMiddleware
{
    public function handle()
    {
        if (!is_user_logged_in()) {
            return Response::error('Access Denied: You must be logged in to make this request')->httpStatus(411);
        }

        return true;
    }
}
