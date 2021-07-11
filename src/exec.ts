import esbuild from 'esbuild'

/**
 * Get entry's default export
 * @param filePath Absolute file path to exec
 */
export const getEntryDefault = (filePath: string) => {
  const result = esbuild.buildSync({
    entryPoints: [filePath],
    bundle: true,
    write: false,
    format: 'cjs'
  })

  const file = result.outputFiles[0]

  const entryModule: any = {
    exports: {}
  }
  const entryExports = entryModule.exports

  new Function('module', 'exports', file.text)(entryModule, entryExports)

  if (entryExports.__esModule) {
    return entryExports.default
  }

  return entryModule.exports
}
