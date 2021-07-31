import path from 'path'

import { Compiler } from '../src'

(async () => {
  const compiler = new Compiler({
    outDir: path.resolve(__dirname, '../dist'),
    root: path.resolve(__dirname, 'cli'),
    name: 'custom'
  })

  await compiler.compile()

  console.log('success')
})()
