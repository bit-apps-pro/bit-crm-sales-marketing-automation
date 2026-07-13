/* eslint-disable no-console */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const PLUGIN_SLUG = 'bit-crm'
const BUILD_DIRECTORY = path.resolve('build')
const OUTPUT_DIRECTORY = path.join(BUILD_DIRECTORY, PLUGIN_SLUG)
const ZIP_PATH = path.join(BUILD_DIRECTORY, `${PLUGIN_SLUG}.zip`)
const shouldCreateZip = process.argv.includes('--zip')

const filesAndFolders = [
  'assets',
  'backend',
  'languages',
  `${PLUGIN_SLUG}.php`,
  'readme.txt',
  'composer.json',
  'composer.lock'
]

function assertCommand(command, args) {
  try {
    execFileSync(command, args, { stdio: 'ignore' })
  } catch {
    throw new Error(`${command} is required to package ${PLUGIN_SLUG}`)
  }
}

function copyRuntimeFiles() {
  for (const item of filesAndFolders) {
    const source = path.resolve(item)
    if (!fs.existsSync(source)) {
      throw new Error(`Required runtime path not found: ${item}`)
    }

    const destination = path.join(OUTPUT_DIRECTORY, item)
    console.log(`➡️  Copying ${item}`)
    fs.cpSync(source, destination, { recursive: true })
  }
}

function runComposer(args) {
  execFileSync('composer', args, { cwd: OUTPUT_DIRECTORY, stdio: 'inherit' })
}

function removeNestedComposerLocks(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      removeNestedComposerLocks(entryPath)
    } else if (entry.name === 'composer.lock') {
      fs.rmSync(entryPath)
    }
  }
}

function generateBuild() {
  console.log('🚀 Generating free build...')

  assertCommand('composer', ['--version'])
  assertCommand('php', ['--version'])
  if (shouldCreateZip) assertCommand('zip', ['--version'])

  fs.rmSync(OUTPUT_DIRECTORY, { force: true, recursive: true })
  fs.rmSync(ZIP_PATH, { force: true })
  fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true })

  copyRuntimeFiles()

  runComposer(['install', '--no-dev', '--prefer-dist', '--no-interaction', '--no-progress'])
  runComposer(['dump-autoload', '--optimize', '--no-dev', '--no-interaction'])

  fs.rmSync(path.join(OUTPUT_DIRECTORY, 'composer.lock'), { force: true })
  fs.rmSync(path.join(OUTPUT_DIRECTORY, 'backend/scripts'), { force: true, recursive: true })
  fs.rmSync(path.join(OUTPUT_DIRECTORY, 'vendor/typisttech'), { force: true, recursive: true })
  removeNestedComposerLocks(path.join(OUTPUT_DIRECTORY, 'vendor'))

  if (shouldCreateZip) {
    execFileSync('zip', ['-qr', `${PLUGIN_SLUG}.zip`, PLUGIN_SLUG], {
      cwd: BUILD_DIRECTORY,
      stdio: 'inherit'
    })
    console.log(`✅ Free ZIP generated at ${ZIP_PATH}`)
    return
  }

  console.log(`✅ Free build generated at ${OUTPUT_DIRECTORY}`)
}

try {
  generateBuild()
} catch (error) {
  console.error('❌ Free build failed:', error)
  process.exitCode = 1
}
