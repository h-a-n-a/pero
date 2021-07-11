import path from 'path'

import { Command } from '../src'

console.log(JSON.stringify(Command.init({
  root: path.join(__dirname, 'cli')
}), null, 4))

// const result = getRoute({
//   root: path.join(__dirname, 'cli')
// })
//
// console.log(JSON.stringify(result, null, 4))
