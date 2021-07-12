import path from 'path'
import { existsSync, rmdirSync } from 'fs'
import esbuild, { BuildOptions } from 'esbuild'

import { getRoute, RouteOptions } from './route'

interface CompileOptions extends RouteOptions {
  outDir: string
}

class Compiler {
  constructor (public options: CompileOptions) {}

  compile () {
    const { root, ignorePattern, outDir } = this.options

    if (existsSync(outDir)) rmdirSync(outDir, { recursive: true })

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
}

export default Compiler
