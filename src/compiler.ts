import path from 'path'
import { existsSync, rmdirSync } from 'fs'
import esbuild, { BuildOptions } from 'esbuild'

import { getRoute, RouteOptions } from './route'

interface CompileOptions extends RouteOptions {
  outDir: string
}

const PERO_CLI_EMIT_DIRECTORY_NAME = '.pero-cli'
const PERO_RUNTIME_NAME = 'pero.js'

class Compiler {
  private readonly cliPath: string

  constructor (public options: CompileOptions) {
    this.cliPath = path.join(this.options.outDir, PERO_CLI_EMIT_DIRECTORY_NAME)
  }

  async compile () {
    const { outDir } = this.options

    if (existsSync(outDir)) rmdirSync(outDir, { recursive: true })

    await this.compileRoutes()
    await this.compileRuntime()
  }

  compileRoutes () {
    const { root, ignorePattern } = this.options
    const outDir = this.cliPath

    const routes = getRoute({
      root,
      ignorePattern
    })

    const compileTasks = routes.map(r => {
      return Promise.all([
        compileSingle(r.path, path.join(outDir, r.relPath), r.isDir),
        ...r.children.map(c => compileSingle(c.path, r.relPath, r.isDir))
      ])
    })

    return Promise.all(compileTasks)

    function compileSingle (inputPath: string, outPath: string, isDir: boolean) {
      const buildOptions: BuildOptions = {
        entryPoints: [inputPath],
        bundle: true,
        format: 'cjs'
      }

      if (isDir) {
        buildOptions.outdir = outPath
      } else {
        buildOptions.outfile = outPath.replace('.ts', '.js')
      }

      return esbuild.build(buildOptions)
    }
  }

  compileRuntime () {
    const { outDir } = this.options

    return esbuild.build({
      stdin: {
        contents: `
            import path from 'path'
            import Command from './command.ts' 
            
            const result = Command.init({
              root: path.resolve(__dirname, '${PERO_CLI_EMIT_DIRECTORY_NAME}') 
            })
            
            console.log(JSON.stringify(result, null, 4))
        `,
        resolveDir: path.resolve(__dirname)
      },
      platform: 'node',
      format: 'cjs',
      outfile: path.join(outDir, PERO_RUNTIME_NAME),
      bundle: true
    })
  }
}

export default Compiler
