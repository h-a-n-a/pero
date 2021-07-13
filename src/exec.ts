/**
 * Get entry's default export
 * @param filePath Absolute file path to exec
 */
export const getEntryDefault = (filePath: string) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const moduleExports = require(filePath)

  // es module default export
  if (moduleExports.__esModule) {
    return typeof moduleExports.default === 'function' ? moduleExports.default : null
  }

  // cjs export
  return typeof moduleExports === 'function' ? moduleExports : null
}
