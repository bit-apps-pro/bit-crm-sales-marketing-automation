#!/usr/bin/env node
/* eslint-disable no-console */

import fse from 'fs-extra'

console.log('🔄️ Syncing plugin common files...')

await Promise.all([fse.emptyDir('./frontend/_plugin-commons'), fse.emptyDir('./.config/_plugin-commons')])

console.log('✅ Deleted existing plugin common files')

await Promise.all([fse.ensureDir('./frontend/_plugin-commons'), fse.ensureDir('./.config/_plugin-commons')])

await Promise.all([
  fse.copy('./_bitapps-plugin-commons/frontend', './frontend/_plugin-commons', { overwrite: true }),
  fse.copy('./_bitapps-plugin-commons/configs', './.config/_plugin-commons', { overwrite: true })
])

console.log('✅ Plugin common files synced')
