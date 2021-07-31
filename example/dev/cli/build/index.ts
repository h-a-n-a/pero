import { Command, Args } from '../../../../src'

export default (command: Command) => {
  command
    .argument('<something>', 'something')
    .argument('[test]', 'name')
    .option('-c, --cheese <type>', 'chess')

  return (args: Args) => {
    console.log(args)
  }
}
