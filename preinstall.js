// Building for sqlcipher
// https://github.com/mapbox/node-sqlite3#building-for-sqlcipher
'use strict'

if (process.platform === 'win32') {
  // windows
  console.warn('`win32` is not supported. Perhaps you should look for `cross-sqlcipher`.')
  process.exit(1)
}
