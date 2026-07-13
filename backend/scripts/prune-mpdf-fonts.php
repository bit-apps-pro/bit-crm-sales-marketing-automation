<?php

declare(strict_types=1);

// This is a CLI-only build script run at composer install/update time (see composer.json
// scripts). It never executes on a live WordPress site, so the WordPress output-escaping and
// filesystem-abstraction rules do not apply here.
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
// phpcs:disable WordPress.WP.AlternativeFunctions

/*
 * Prune heavy mPDF fonts.
 *
 * Set BITCRM_SKIP_MPDF_FONT_PRUNE=1 to skip pruning.
 */
if (getenv('BITCRM_SKIP_MPDF_FONT_PRUNE') === '1') {
    exit(0);
}

$fontsDir = __DIR__ . '/../../vendor/mpdf/mpdf/ttfonts';
if (!is_dir($fontsDir)) {
    exit(0);
}

$allowedFiles = [
    'DejaVuSans.ttf',
    'DejaVuSans-Bold.ttf',
    'DejaVuSans-BoldOblique.ttf',
    'DejaVuSans-Oblique.ttf',
];

$deleted = 0;

$entries = scandir($fontsDir);
if ($entries === false) {
    exit(0);
}

foreach ($entries as $entry) {
    if ($entry === '.' || $entry === '..') {
        continue;
    }

    $fullPath = $fontsDir . '/' . $entry;
    if (!is_file($fullPath)) {
        continue;
    }

    // WordPress core is not loaded in this composer CLI context, so wp_delete_file() is
    // unavailable; unlink() is the only option here.
    if (!in_array($entry, $allowedFiles, true) && @unlink($fullPath)) { // phpcs:ignore WordPress.WP.AlternativeFunctions.unlink_unlink
        ++$deleted;
    }
}

fwrite(STDOUT, "[bit-crm] mPDF font prune: removed {$deleted} files\n");
