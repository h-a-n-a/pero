import path from 'path'
import fs from 'fs'
import * as esbuild from 'esbuild'

(async () => {
  const srcPath = path.resolve(__dirname, '../src')
  const outPath = path.resolve(__dirname, '../dist')
  const entryPoints = fs.readdirSync(srcPath)

  const build = (entry: string, outfile: string) => {
    return esbuild.build({
      entryPoints: [entry],
      format: 'cjs',
      platform: 'node',
      target: 'node12',
      outfile
    })
  }

  await Promise.all(
    entryPoints.map(
      entry => build(
        path.resolve(srcPath, entry),
        path.resolve(outPath, entry.replace('.ts', '.js'))
      )
    )
  )
})()
