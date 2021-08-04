import { Command, Args } from '../../../../src'

export default (command: Command) => {
  command
    .description('build an app')
    .argument('[test]', 'name')
    .argument('<something>', 'something')
    .option('-d', 'dessert')
    .option('-c, --cheese', 'chess')
    .option('-v, --pizza-type <test>', 'version')

  return (args: Args) => {
    console.log(args)
    command.help()
  }
}
