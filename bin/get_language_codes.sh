#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PARENT_DIR" || exit 1

LANGUAGE_DIR="$PARENT_DIR/languages"
PATTERN="bit-crm-sales-marketing-automation-(.*).mo"

LANG_CODES=()

for file in "$LANGUAGE_DIR"/bit-crm-sales-marketing-automation-*.mo; do
    if [[ -f "$file" ]]; then
        if [[ $(basename "$file") =~ $PATTERN ]]; then
            lang_code="${BASH_REMATCH[1]}"
            LANG_CODES+=("$lang_code")
        fi
    fi
done

echo "${LANG_CODES[@]}"
