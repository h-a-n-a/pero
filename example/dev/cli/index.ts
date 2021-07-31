import { Command } from '../../../src'

export default (command: Command) => {
  command.option('-e, --environment', 'environment')

  // action
  return () => {

  }
}
