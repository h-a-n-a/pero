import path from 'path'
import { existsSync, rmdirSync } from 'fs'
import * as esbuild from 'esbuild'
import { BuildResult, BuildOptions } from 'esbuild'

import { getRoute, RouteOptions, Route } from './route'

interface CompileOptions extends RouteOptions {
  outDir: string
}

const PERO_CLI_EMIT_DIRECTORY_NAME = 'pero-cli'
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

    return compileRoute(routes)

    function compileRoute (routes: Route[]): Promise<BuildResult[]> {
      return routes.reduce<Promise<BuildResult[]>>(async (buildResults, route) => {
        if (route.isDir) {
          return [
            ...await buildResults,
            ...(await compileRoute(route.children))
          ]
        }

        return [
          ...await buildResults,
          await compileSingle(route.path, path.join(outDir, route.relPath)),
          ...(await compileRoute(route.children))
        ]
      }, Promise.resolve([]))
    }

    function compileSingle (inputPath: string, outPath: string) {
      const buildOptions: BuildOptions = {
        entryPoints: [inputPath],
        bundle: true,
        format: 'cjs',
        outfile: outPath.replace('.ts', '.js')
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
            
            console.log(JSON.stringify(result.registeredCommands, null, 4))
            console.log(result.parse())
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
