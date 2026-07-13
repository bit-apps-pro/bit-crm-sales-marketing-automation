<?php

declare(strict_types=1);

/**
 * Remove development-only files from vendor/ before the production zip is built.
 *
 * Wired into composer's post-install-cmd / post-update-cmd hooks. It acts ONLY during a
 * production install (`composer install --no-dev`, where composer sets COMPOSER_DEV_MODE=0);
 * a normal local `composer install` is left untouched. Set BITCRM_SKIP_VENDOR_PRUNE=1 to skip.
 *
 * Everything removed here is non-runtime (CI config, docs, tests, CLI binstubs). The rules were
 * audited against the locked dependency tree: nothing pruned is autoloaded or read at runtime.
 *
 * This is a CLI build script — it never runs on a live site, so WordPress filesystem/escaping
 * rules do not apply.
 */

// phpcs:disable WordPress.WP.AlternativeFunctions, WordPress.Security.EscapeOutput.OutputNotEscaped

if (getenv('BITCRM_SKIP_VENDOR_PRUNE') === '1') {
    return;
}

/*
 * COMPOSER_DEV_MODE is "0" only for --no-dev installs; a normal dev install sets it "1", and
 * running this script outside composer leaves it unset (getenv returns false). Anything but an
 * explicit "0" means "not a production build", so we do nothing.
 */
if (getenv('COMPOSER_DEV_MODE') !== '0') {
    return;
}

$vendorDir = __DIR__ . '/../../vendor';
if (!is_dir($vendorDir)) {
    return;
}

// What counts as "development only". All names are lower-case; matching is case-insensitive.
$config = [
    // Whole directories deleted wherever they appear.
    'dirs' => [
        'test', 'tests', 'doc', 'docs', 'example', 'examples',
        'bin',                                  // composer binstubs / package CLI scripts
        '.github', '.gitlab', '.circleci', '.git',
    ],

    /*
     * Files deleted by extension. Safe to drop wholesale: no YAML/TOML parser ships in this
     * tree, and shell/batch scripts are never executed at runtime.
     */
    'extensions' => [
        'md', 'markdown', 'rst', 'dist', 'neon',
        'yml', 'yaml', 'toml',
        'sh', 'bash', 'bat', 'cmd', 'ps1',
    ],

    /*
     * Files deleted by exact name — dev config whose extension is too broad to drop wholesale
     * (e.g. plain *.xml can be runtime, so only known dev rulesets are named here).
     */
    'files' => [
        '.editorconfig', '.gitignore', '.gitattributes', '.gitmodules',
        '.php-cs-fixer.php', '.php_cs', '.php_cs.dist',
        'phpunit.xml', 'phpcs.xml', '.phpcs.xml', 'ruleset.xml', 'psalm.xml',
        'phpstan.neon', 'phpbench.json', 'makefile',
    ],

    /*
     * Never delete these, whatever their extension. Required when redistributing GPL
     * dependencies, and guards the *.md rule from taking LICENSE.md / NOTICE.md.
     */
    'keepPrefixes' => ['license', 'licence', 'copying', 'copyright', 'notice'],
];

$stats = ['dirs' => 0, 'files' => 0, 'bytes' => 0];
pruneVendorDir($vendorDir, $config, $stats);

printf(
    "[bit-crm] vendor prune: removed %d dirs and %d files (~%d KB)\n",
    $stats['dirs'],
    $stats['files'],
    (int) round($stats['bytes'] / 1024)
);

/**
 * Walk $dir: delete dev directories wholesale, delete dev files individually, recurse into the
 * rest. Symlinks are never followed or removed. Counters accumulate in $stats.
 */
function pruneVendorDir(string $dir, array $config, array &$stats): void
{
    foreach (scandir($dir) ?: [] as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }

        $path = $dir . '/' . $entry;
        $name = strtolower($entry);

        if (is_link($path)) {
            continue;
        }

        if (is_dir($path)) {
            if (in_array($name, $config['dirs'], true)) {
                deleteDirectory($path, $config['keepPrefixes'], $stats);
            } else {
                pruneVendorDir($path, $config, $stats);
            }

            continue;
        }

        if (isProtected($name, $config['keepPrefixes'])) {
            continue;
        }

        $extension = strtolower(pathinfo($entry, PATHINFO_EXTENSION));
        if (in_array($extension, $config['extensions'], true) || in_array($name, $config['files'], true)) {
            $size = (int) filesize($path);
            if (@unlink($path)) {
                ++$stats['files'];
                $stats['bytes'] += $size;
            }
        }
    }
}

/**
 * Recursively delete a directory and its contents, updating $stats (dirs, files, bytes).
 *
 * Protected files (LICENSE/NOTICE/...) are kept even when nested inside a pruned directory — e.g.
 * a bundled binary's licence under bin/. rmdir() only removes empty directories, so a preserved
 * file automatically keeps its parent-directory chain alive; everything else is still deleted.
 *
 * Counters reflect what was actually removed: bytes/files only on a successful unlink(), and a
 * directory only when its rmdir() succeeds — so a chain kept alive by a protected file is not
 * counted, and every nested directory that is removed is.
 */
function deleteDirectory(string $dir, array $keepPrefixes, array &$stats): void
{
    foreach (scandir($dir) ?: [] as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }

        $path = $dir . '/' . $entry;
        if (is_dir($path) && !is_link($path)) {
            deleteDirectory($path, $keepPrefixes, $stats);
        } elseif (!isProtected(strtolower($entry), $keepPrefixes)) {
            $size = (int) @filesize($path);
            if (@unlink($path)) {
                ++$stats['files'];
                $stats['bytes'] += $size;
            }
        }
    }

    if (@rmdir($dir)) {
        ++$stats['dirs'];
    }
}

/** True when the file name starts with a protected prefix (LICENSE, NOTICE, ...). */
function isProtected(string $lowerName, array $prefixes): bool
{
    foreach ($prefixes as $prefix) {
        if (str_starts_with($lowerName, $prefix)) {
            return true;
        }
    }

    return false;
}
