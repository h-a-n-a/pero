import path from 'path'

import { Command, Args, Compiler } from '../'

export default (command: Command) => {
  command
    .argument('<name>', 'cli name')
    .argument('[entry]', 'source cli directory path, default: \'src\'')
    // .option('-w, --watch', 'watch compilation')
    .option('-d, --dirPath <cli-dir>', 'source cli directory path')
    .option('-o, --outDir <out-dir>', 'output directory path, default: \'dist\'')

  return async (args: Args) => {
    if (!Object.keys(args).length) {
      command.help()
      return
    }

    const { name, entry, dirPath, outDir } = args

    const startTime = Date.now()

    const compiler = new Compiler({
      outDir: path.resolve(outDir || './dist'),
      root: path.resolve(entry || dirPath || './src'),
      name
    })

    await compiler.compile()

    const endTime = Date.now()

    console.log(`✨ compilation finished in ${((endTime - startTime) / 1000).toFixed(2)}s`)
  }
}
