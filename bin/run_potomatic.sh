#!/bin/bash

if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY environment variable is not set."
    echo "Please set it before running this script."
    # exit 1
fi

LANGUAGE_DIR="languages"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PARENT_DIR" || exit 1

echo "Extracting language codes from existing .mo files..."
LANG_CODES=$("$SCRIPT_DIR"/get_language_codes.sh)

if [ -z "$LANG_CODES" ]; then
    echo "No language codes found in $LANGUAGE_DIR directory."
    exit 1
fi

echo "Found language codes: $LANG_CODES"

POT_FILE_PATH="languages/bit-crm-sales-marketing-automation.pot"

if [ ! -f "$POT_FILE_PATH" ]; then
    echo "Error: POT file not found at $POT_FILE_PATH"
    exit 1
fi

for lang in $LANG_CODES; do
    echo "Processing language: $lang"

    pnpm potomatic \
        --target-languages "$lang" \
        --pot-file-path "$POT_FILE_PATH" \
        --output-dir "languages/" \
        --po-file-prefix "bit-crm-sales-marketing-automation-" \
        --provider openai \
        --api-key "$OPENAI_API_KEY" \
        -m "gpt-4.1-mini" \
        --abort-on-failure

    if [ $? -eq 0 ]; then
        wp i18n make-mo "$LANGUAGE_DIR/bit-crm-sales-marketing-automation-$lang.po" "$LANGUAGE_DIR/"
        echo "Successfully processed language: $lang"
    else
        echo "Error processing language: $lang"
    fi

    echo "---"
done

echo "Finished processing all languages."
