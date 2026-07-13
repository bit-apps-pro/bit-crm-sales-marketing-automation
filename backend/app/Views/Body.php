<?php

namespace BitApps\Crm\Views;

use BitApps\Crm\Config;

class Body
{
    public function render()
    {
        $assetURI = Config::get('ASSET_URI');
        // phpcs:disable Generic.PHP.ForbiddenFunctions.Found
        // phpcs:disable WordPress.Security.EscapeOutput.HeredocOutputNotEscaped

        $allowedTags = [
            'noscript' => [],
            'div'      => [
                'id'    => [],
                'style' => []
            ],
            'h1'  => [],
            'img' => [
                'alt'   => [],
                'class' => [],
                'width' => [],
                'src'   => []
            ],
            'p' => [],
        ];

        echo wp_kses(
            "<noscript>You need to enable JavaScript to run this app.</noscript>
      <div id=bit-apps-root>
        <div
          style=display:flex;flex-direction:column;justify-content:center;align-items:center;height:90vh;font-family:Tahoma, Geneva, Verdana, sans-serif;>
          <img alt=app-logo class=bit-logo width=70 src={$assetURI}/logo.svg>
          <h1>Welcome to Bit CRM.</h1>
          <p></p>
        </div>
       </div>",
            $allowedTags
        );
    }
}
