import { Option, Argument } from '../../../src'

export default (option: Option) => {
  option('-r', '123123')

  return (args: Argument) => {
    console.log(args)
  }
}
