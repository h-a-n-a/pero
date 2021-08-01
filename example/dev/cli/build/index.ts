import { Command, Args } from '../../../../src'

export default (command: Command) => {
  command
    .description('build an app')
    .argument('<something>', 'something')
    .argument('[test]', 'name')
    .option('-c, --cheese <type>', 'chess')
    .option('-v, --version', 'version')

  return (args: Args) => {
    console.log(args)
    command.help()
  }
}
