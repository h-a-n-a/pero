import path from 'path'

import { getRoute } from '../src'

const result = getRoute({
  root: path.join(__dirname, 'cli')
})

console.log(JSON.stringify(result, null, 4))
