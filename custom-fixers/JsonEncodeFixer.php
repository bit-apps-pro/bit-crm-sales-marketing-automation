<?php

namespace BitApps\Crm\Fixers;

use PhpCsFixer\Fixer\FixerInterface;
use PhpCsFixer\FixerDefinition\CodeSample;
use PhpCsFixer\FixerDefinition\FixerDefinition;
use PhpCsFixer\FixerDefinition\FixerDefinitionInterface;
use PhpCsFixer\Tokenizer\Token;
use PhpCsFixer\Tokenizer\Tokens;
use SplFileInfo;

final class JsonEncodeFixer implements FixerInterface
{
    public function getName(): string
    {
        return 'BitApps/replace_json_encode';
    }

    public function getPriority(): int
    {
        // priority of the fixer
        return 0;
    }

    public function isCandidate(Tokens $tokens): bool
    {
        // logic to determine if the file is a candidate for fixing
        return $tokens->isTokenKindFound(T_STRING);
    }

    public function isRisky(): bool
    {
        // return true if the fixer is risky
        return false;
    }

    public function supports(SplFileInfo $file): bool
    {
        // logic to determine if the fixer supports a given file
        return !($file->getFilename() === 'NamespaceUpdater.php');
    }

    public function fix(SplFileInfo $file, Tokens $tokens): void
    {
        // logic to replace json_encode with wp_json_encode
        foreach ($tokens as $index => $token) {
            if ($token->isGivenKind(T_STRING) && $token->getContent() === 'json_encode') {
                $tokens[$index] = new Token([T_STRING, 'wp_json_encode']);
            }
        }
    }

    public function getDefinition(): FixerDefinitionInterface
    {
        return new FixerDefinition(
            'Replaces all instances of json_encode with wp_json_encode.',
            [
                new CodeSample("<?php\njson_encode(\$data);\n"),
                new CodeSample("<?php\nwp_json_encode(\$data);\n")
            ]
        );
    }
}
