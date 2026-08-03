<?php

namespace BitApps\Crm\src\Queue;

use WP_Background_Process;

abstract class SafeBackgroundProcess extends WP_Background_Process
{
    /**
     * Parent's chain_id is private, so the override keeps its own copy.
     *
     * @var string
     */
    private $safeChainId;

    /**
     * Non-dying replacement for the parent's get_chain_id().
     *
     * The parent calls check_ajax_referer() whenever wp_doing_ajax() is true,
     * assuming the current request is this process's own worker loopback. When
     * dispatch() runs inside another plugin's admin-ajax worker (bit-pi,
     * bit-integrations, bit-form), that nonce check fails and wp_die() kills the
     * host request mid-hook, stranding the saved batch until an unrelated
     * dispatch flushes it. Verify the nonce without dying instead, and only
     * trust the chain_id query arg when it was genuinely sent to this
     * process's own worker request.
     *
     * @return string
     */
    /**
     * Mint the dispatch nonce as user 0 when the current request carries no
     * login cookie (Application Password / Basic auth, WP-CLI, cron with a
     * user set). The loopback only forwards cookies, so it authenticates as
     * user 0 — a nonce minted for the dispatching user would fail the
     * worker's own nonce check and strand the saved batch.
     *
     * @return array
     */
    protected function get_query_args()
    {
        if (!is_user_logged_in() || !empty($_COOKIE[LOGGED_IN_COOKIE])) {
            return parent::get_query_args();
        }

        $userId = get_current_user_id();
        wp_set_current_user(0);

        try {
            return parent::get_query_args();
        } finally {
            wp_set_current_user($userId);
        }
    }

    public function get_chain_id()
    {
        if (
            empty($this->safeChainId)
            && wp_doing_ajax()
            && isset($_REQUEST['nonce'], $_GET[static::CHAIN_ID_ARG_NAME])
            && wp_verify_nonce(sanitize_key(wp_unslash($_REQUEST['nonce'])), $this->identifier)
        ) {
            $chainId = sanitize_key(wp_unslash($_GET[static::CHAIN_ID_ARG_NAME]));

            if (wp_is_uuid($chainId)) {
                return $this->safeChainId = $chainId;
            }
        }

        if (empty($this->safeChainId)) {
            $this->safeChainId = wp_generate_uuid4();
        }

        return $this->safeChainId;
    }
}