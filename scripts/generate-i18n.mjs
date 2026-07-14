#!/usr/bin/env node

import { convertPOTToPHP } from 'bitapps-dev-utils/utils/pot-to-php.mjs'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import process from 'node:process'
import 'dotenv/config'

const { PLUGIN_SLUG } = process.env

if (!PLUGIN_SLUG) {
  throw new Error('PLUGIN_SLUG is required to generate translations')
}

if (process.platform === 'win32') {
  throw new Error('Translation generation requires Linux, macOS, or WSL')
}

const frontendPotFile = 'languages/frontend.pot'
const frontendStringsFile = 'languages/frontend-extracted-strings.php'
const parserConfig = './.gettext-parser.config.cjs'
const frontendFiles = './frontend/**/*.{js,jsx,ts,tsx}'
const potFileHeader = JSON.stringify({
  'Language-Team': 'Bit Apps <support@bitapps.pro>',
  'Last-Translator': 'Bit Apps <developer@bitapps.pro>',
  'PO-Revision-Date': ''
})
const execOptions = { stdio: 'inherit' }

if (!existsSync('languages')) mkdirSync('languages')

execFileSync(
  'pnpm',
  ['exec', 'react-gettext-parser', '--output', frontendPotFile, '--config', parserConfig, frontendFiles],
  execOptions
)

convertPOTToPHP(frontendPotFile, frontendStringsFile, PLUGIN_SLUG)

execFileSync(
  'wp',
  [
    'i18n',
    'make-pot',
    '.',
    `languages/${PLUGIN_SLUG}.pot`,
    `--slug=${PLUGIN_SLUG}`,
    '--ignore-domain',
    '--skip-js',
    '--include=backend,languages',
    `--headers=${potFileHeader}`
  ],
  execOptions
)
