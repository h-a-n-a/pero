import fs from 'fs'
import path from 'path'

import * as esbuild from 'esbuild'

import { Compiler } from '../src'

;(async () => {
  const srcPath = path.resolve(__dirname, '../src')
  const outPath = path.resolve(__dirname, '../dist')
  const entryPoints =
    fs.readdirSync(srcPath, { withFileTypes: true })
      .map(content => {
        if (content.isDirectory()) return null
        return content.name
      })
      .filter((content): content is string => Boolean(content))

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

  const compiler = new Compiler({
    outDir: path.resolve(__dirname, '../dist/cli'),
    root: path.resolve(__dirname, '../src/cli'),
    name: 'pero'
  })

  await compiler.compile({
    external: ['esbuild'],
    bundle: true
  })
})()
