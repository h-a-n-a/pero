import path from 'path'

import { Command, Compiler } from '../src'

// console.log(JSON.stringify(Command.init({
//   root: path.join(__dirname, 'cli')
// }), null, 4))

(async () => {
  const compiler = new Compiler({
    outDir: path.resolve(__dirname, '../dist'),
    root: path.resolve(__dirname, 'cli')
  })

  await compiler.compile()

  console.log('success')
})()

// const result = getRoute({
//   root: path.join(__dirname, 'cli')
// })
//
// console.log(JSON.stringify(result, null, 4))
