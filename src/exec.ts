import { readFileSync } from 'fs'

/**
 * Get entry's default export
 * @param filePath Absolute file path to exec
 */
export const getEntryDefault = (filePath: string) => {
  const fileText = readFileSync(filePath, 'utf-8')

  const entryModule: any = {
    exports: {}
  }
  const entryExports = entryModule.exports

  new Function('module', 'exports', fileText)(entryModule, entryExports)

  // es module default export
  if (entryModule.exports.__esModule) {
    return typeof entryModule.exports.default === 'function' ? entryModule.exports.default : null
  }

  // cjs export
  return typeof entryModule.exports === 'function' ? entryModule.exports : null
}
