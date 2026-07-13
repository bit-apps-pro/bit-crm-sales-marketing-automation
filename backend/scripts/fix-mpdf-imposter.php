<?php

/**
 * Fix mPDF Imposter Plugin Namespace Issues.
 *
 * This script fixes namespace prefixing issues that the typisttech/imposter-plugin
 * misses in the mpdf package. It handles:
 * - Double backslash issues in trait use statements
 * - Unprefixed extends/implements clauses
 * - Unprefixed new/instanceof expressions
 * - Unprefixed catch clauses
 * - String-based class names
 * - DocBlock annotations
 *
 * Run after composer install/update via:
 *   php backend/scripts/fix-mpdf-imposter.php
 */

declare(strict_types=1);

// This is a CLI-only build script run at composer install/update time (see composer.json
// scripts). It never executes on a live WordPress site, so the WordPress output-escaping and
// filesystem-abstraction rules do not apply here.
// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
// phpcs:disable WordPress.WP.AlternativeFunctions

// Configuration
$prefix = 'BitApps\Crm\Deps\\';
$prefixForStrings = 'BitApps\\\Crm\\\Deps\\\\'; // Double escaped for PHP strings
$vendorDir = __DIR__ . '/../../vendor/mpdf';

// Namespaces to prefix (without leading backslash)
$namespacesToPrefix = [
    'Mpdf',
    'setasign',
    'Psr',
];

/**
 * Get all PHP files in a directory recursively.
 */
function getPhpFiles(string $dir): array
{
    $files = [];
    if (!is_dir($dir)) {
        return $files;
    }

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS)
    );

    foreach ($iterator as $file) {
        if ($file->isFile() && $file->getExtension() === 'php') {
            $files[] = $file->getPathname();
        }
    }

    return $files;
}

/**
 * Apply all fixes to a file's content.
 */
function fixFileContent(string $content, string $prefix, string $prefixForStrings, array $namespacesToPrefix): string
{
    $modified = $content;

    // Build regex patterns for namespaces
    $nsPattern = implode('|', array_map('preg_quote', $namespacesToPrefix));

    // Negative lookbehind to avoid double-prefixing
    // Checks that the namespace is not preceded by "Deps" (indicating already prefixed)
    // Note: The backslash is part of the match pattern, so we only check for "Deps"
    $notPrefixed = '(?<!Deps)';

    // =================================================================
    // FIX 0: Remove duplicate prefix (BitApps\Crm\Deps\BitApps\Crm\Deps\ -> \BitApps\Crm\Deps\)
    // This can happen when imposter runs multiple times or on already-prefixed code
    // For trait use in class body, we need leading backslash
    // =================================================================
    $modified = preg_replace(
        '/\buse\s+BitApps\\\Crm\\\Deps\\\\\\\?BitApps\\\Crm\\\Deps\\\((?:' . $nsPattern . ')\\\[^\s{;]+)/',
        'use \\\BitApps\Crm\Deps\\\$1',
        $modified
    );

    // =================================================================
    // FIX 1: Double backslash in trait use inside class body
    // Pattern: use BitApps\Crm\Deps\\setasign\... -> use \BitApps\Crm\Deps\setasign\...
    // =================================================================
    $modified = preg_replace(
        '/\buse\s+BitApps\\\Crm\\\Deps\\\\\\\((?:' . $nsPattern . ')\\\[^\s{;]+)/',
        'use \\\BitApps\Crm\Deps\\\$1',
        $modified
    );

    // =================================================================
    // FIX 1b: Trait use without leading backslash (needs to be fully qualified)
    // Pattern: use BitApps\Crm\Deps\setasign\... -> use \BitApps\Crm\Deps\setasign\...
    // Only matches trait use inside class body (followed by { or ;)
    // =================================================================
    $modified = preg_replace(
        '/\buse\s+BitApps\\\Crm\\\Deps\\\((?:' . $nsPattern . ')\\\[^\s{;]+)\s*\{/',
        'use \\\BitApps\Crm\Deps\\\$1 {',
        $modified
    );

    // =================================================================
    // FIX 2: extends \Namespace\... (unprefixed)
    // Pattern: extends \Mpdf\... -> extends \BitApps\Crm\Deps\Mpdf\...
    // =================================================================
    $modified = preg_replace_callback(
        '/\bextends\s+' . $notPrefixed . '\\\(' . $nsPattern . ')\\\/',
        function ($matches) use ($prefix) {
            return 'extends \\' . $prefix . $matches[1] . '\\';
        },
        $modified
    );

    // =================================================================
    // FIX 3: implements \Namespace\... (unprefixed)
    // Can have multiple interfaces separated by commas
    // Pattern: implements \Psr\Log\... -> implements \BitApps\Crm\Deps\Psr\Log\...
    // =================================================================
    $modified = preg_replace_callback(
        '/\bimplements\s+([^{]+)\{/',
        function ($matches) use ($prefix, $nsPattern) {
            $interfaces = $matches[1];

            // Negative lookbehind to avoid double-prefixing
            $notPrefixed = '(?<!Deps)';

            // Replace each unprefixed namespace
            $interfaces = preg_replace_callback(
                '/' . $notPrefixed . '\\\(' . $nsPattern . ')\\\([A-Za-z0-9_\\\]+)/',
                function ($m) use ($prefix) {
                    return '\\' . $prefix . $m[1] . '\\' . $m[2];
                },
                $interfaces
            );

            return 'implements ' . $interfaces . '{';
        },
        $modified
    );

    // =================================================================
    // FIX 4: new \Namespace\... (unprefixed)
    // Pattern: new \Mpdf\MpdfException -> new \BitApps\Crm\Deps\Mpdf\MpdfException
    // =================================================================
    $modified = preg_replace_callback(
        '/\bnew\s+' . $notPrefixed . '\\\(' . $nsPattern . ')\\\/',
        function ($matches) use ($prefix) {
            return 'new \\' . $prefix . $matches[1] . '\\';
        },
        $modified
    );

    // =================================================================
    // FIX 5: instanceof \Namespace\... (unprefixed)
    // Pattern: instanceof \Mpdf\... -> instanceof \BitApps\Crm\Deps\Mpdf\...
    // Skip built-in classes
    // =================================================================
    $modified = preg_replace_callback(
        '/\binstanceof\s+' . $notPrefixed . '\\\(' . $nsPattern . ')\\\/',
        function ($matches) use ($prefix) {
            return 'instanceof \\' . $prefix . $matches[1] . '\\';
        },
        $modified
    );

    // =================================================================
    // FIX 6: catch (\Namespace\... (unprefixed)
    // Pattern: catch (\Mpdf\... -> catch (\BitApps\Crm\Deps\Mpdf\...
    // =================================================================
    $modified = preg_replace_callback(
        '/\bcatch\s*\(\s*' . $notPrefixed . '\\\(' . $nsPattern . ')\\\/',
        function ($matches) use ($prefix) {
            return 'catch (\\' . $prefix . $matches[1] . '\\';
        },
        $modified
    );

    // =================================================================
    // FIX 6b: Static method calls \Namespace\Class::method (unprefixed)
    // Pattern: \Mpdf\Tag::method -> \BitApps\Crm\Deps\Mpdf\Tag::method
    // =================================================================
    $modified = preg_replace_callback(
        '/' . $notPrefixed . '\\\(' . $nsPattern . ')\\\([A-Za-z0-9_\\\]+)::/',
        function ($matches) use ($prefix) {
            return '\\' . $prefix . $matches[1] . '\\' . $matches[2] . '::';
        },
        $modified
    );

    // For string patterns, we check that the string starts with the namespace (not already prefixed)
    // Negative lookbehind for strings: (?<!Deps\\\\\\\\) (4 backslashes = 2 literal backslashes in string)
    $notPrefixedStr = '(?<!Deps\\\\\\\)';

    // =================================================================
    // FIX 7: String-based class names with single quotes
    // Pattern: 'Mpdf\Tag\\' -> 'BitApps\\Crm\\Deps\\Mpdf\\Tag\\'
    // Only match if starts with namespace (not already prefixed)
    // =================================================================
    $modified = preg_replace_callback(
        "/\\'(" . $nsPattern . ")\\\\([^']+)\\'/",
        function ($matches) use ($prefixForStrings) {
            // Check if already prefixed (starts with BitApps)
            if (strpos($matches[0], 'BitApps') !== false) {
                return $matches[0];
            }

            return "'" . $prefixForStrings . $matches[1] . '\\' . $matches[2] . "'";
        },
        $modified
    );

    // =================================================================
    // FIX 8: String-based class names with double quotes
    // Pattern: "Mpdf\Tag\\" -> "BitApps\\Crm\\Deps\\Mpdf\\Tag\\"
    // =================================================================
    $modified = preg_replace_callback(
        '/"(' . $nsPattern . ')\\\([^"]+)"/',
        function ($matches) use ($prefixForStrings) {
            // Check if already prefixed
            if (strpos($matches[0], 'BitApps') !== false) {
                return $matches[0];
            }

            return '"' . $prefixForStrings . $matches[1] . '\\' . $matches[2] . '"';
        },
        $modified
    );

    // =================================================================
    // FIX 9: function_exists with namespace (without leading backslash)
    // Pattern: function_exists('Mpdf\func') -> function_exists('BitApps\\Crm\\Deps\\Mpdf\\func')
    // =================================================================
    $modified = preg_replace_callback(
        "/function_exists\\s*\\(\\s*'(" . $nsPattern . ")\\\\([^']+)'\\s*\\)/",
        function ($matches) use ($prefixForStrings) {
            // Check if already prefixed
            if (strpos($matches[0], 'BitApps') !== false) {
                return $matches[0];
            }

            return "function_exists('" . $prefixForStrings . $matches[1] . '\\' . $matches[2] . "')";
        },
        $modified
    );

    // =================================================================
    // FIX 9b: function_exists with namespace (WITH leading backslash in string)
    // Pattern: function_exists('\Mpdf\func') -> function_exists('\BitApps\Crm\Deps\Mpdf\func')
    // Note: The leading backslash in the string should be preserved
    // =================================================================
    $modified = preg_replace_callback(
        "/function_exists\\s*\\(\\s*'\\\\(" . $nsPattern . ")\\\\([^']+)'\\s*\\)/",
        function ($matches) use ($prefix) {
            // Check if already prefixed
            if (strpos($matches[0], 'BitApps') !== false) {
                return $matches[0];
            }

            // Use single backslashes since the string already has leading backslash
            return "function_exists('\\" . $prefix . $matches[1] . '\\' . $matches[2] . "')";
        },
        $modified
    );

    // =================================================================
    // FIX 10: class_exists with namespace (single quotes)
    // Pattern: class_exists('Mpdf\Class') -> class_exists('BitApps\\Crm\\Deps\\Mpdf\\Class')
    // =================================================================
    $modified = preg_replace_callback(
        "/class_exists\\s*\\(\\s*'(" . $nsPattern . ")\\\\([^']+)'\\s*\\)/",
        function ($matches) use ($prefixForStrings) {
            // Check if already prefixed
            if (strpos($matches[0], 'BitApps') !== false) {
                return $matches[0];
            }

            return "class_exists('" . $prefixForStrings . $matches[1] . '\\' . $matches[2] . "')";
        },
        $modified
    );

    // =================================================================
    // FIX 11: DocBlock @var \Namespace\...
    // Pattern: @var \Mpdf\Mpdf -> @var \BitApps\Crm\Deps\Mpdf\Mpdf
    // =================================================================
    $modified = preg_replace_callback(
        '/@var\s+' . $notPrefixed . '\\\(' . $nsPattern . ')\\\/',
        function ($matches) use ($prefix) {
            return '@var \\' . $prefix . $matches[1] . '\\';
        },
        $modified
    );

    // =================================================================
    // FIX 12: DocBlock @param \Namespace\...
    // =================================================================
    $modified = preg_replace_callback(
        '/@param\s+' . $notPrefixed . '\\\(' . $nsPattern . ')\\\/',
        function ($matches) use ($prefix) {
            return '@param \\' . $prefix . $matches[1] . '\\';
        },
        $modified
    );

    // =================================================================
    // FIX 13: DocBlock @return \Namespace\...
    // =================================================================
    $modified = preg_replace_callback(
        '/@return\s+' . $notPrefixed . '\\\(' . $nsPattern . ')\\\/',
        function ($matches) use ($prefix) {
            return '@return \\' . $prefix . $matches[1] . '\\';
        },
        $modified
    );

    // =================================================================
    // FIX 14: DocBlock @throws \Namespace\...
    // =================================================================
    $modified = preg_replace_callback(
        '/@throws\s+' . $notPrefixed . '\\\(' . $nsPattern . ')\\\/',
        function ($matches) use ($prefix) {
            return '@throws \\' . $prefix . $matches[1] . '\\';
        },
        $modified
    );

    // =================================================================
    // FIX 15: DocBlock @see \Namespace\...
    // =================================================================
    $modified = preg_replace_callback(
        '/@see\s+' . $notPrefixed . '\\\(' . $nsPattern . ')\\\/',
        function ($matches) use ($prefix) {
            return '@see \\' . $prefix . $matches[1] . '\\';
        },
        $modified
    );

    // =================================================================
    // FIX 16: DocBlock @mixin Namespace (without leading backslash)
    // Pattern: @mixin Mpdf -> @mixin \BitApps\Crm\Deps\Mpdf
    // =================================================================
    return preg_replace_callback(
        '/@mixin\s+(' . $nsPattern . ')(?:\s|$|\n)/',
        function ($matches) use ($prefix) {
            return '@mixin \\' . $prefix . $matches[1] . "\n";
        },
        $modified
    );
}

/**
 * Process a single file.
 */
function processFile(string $filePath, string $prefix, string $prefixForStrings, array $namespacesToPrefix): bool
{
    $content = file_get_contents($filePath);
    if ($content === false) {
        echo "  ERROR: Could not read file\n";

        return false;
    }

    $modified = fixFileContent($content, $prefix, $prefixForStrings, $namespacesToPrefix);

    if ($modified !== $content) {
        $result = file_put_contents($filePath, $modified);
        if ($result === false) {
            echo "  ERROR: Could not write file\n";

            return false;
        }

        return true;
    }

    return false;
}

// Main execution
echo "=== mPDF Imposter Namespace Fix Script ===\n\n";

if (!is_dir($vendorDir)) {
    echo "ERROR: Vendor directory not found: {$vendorDir}\n";
    echo "Make sure to run 'composer install' first.\n";

    exit(1);
}

$directories = [
    $vendorDir . '/mpdf/src',
    $vendorDir . '/psr-log-aware-trait/src',
    $vendorDir . '/psr-http-message-shim/src',
];

$totalFiles = 0;
$modifiedFiles = 0;

foreach ($directories as $dir) {
    if (!is_dir($dir)) {
        echo "Skipping (not found): {$dir}\n";

        continue;
    }

    echo "Processing: {$dir}\n";
    $files = getPhpFiles($dir);

    foreach ($files as $file) {
        ++$totalFiles;
        $relativePath = str_replace($vendorDir . '/', '', $file);

        if (processFile($file, $prefix, $prefixForStrings, $namespacesToPrefix)) {
            ++$modifiedFiles;
            echo "  FIXED: {$relativePath}\n";
        }
    }
}

echo "\n=== Summary ===\n";
echo "Total files scanned: {$totalFiles}\n";
echo "Files modified: {$modifiedFiles}\n";
echo "Done!\n";
