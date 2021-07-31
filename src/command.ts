import { parseArgument } from './utils'

export interface Option {
  flagExpression: string
  description: string
}

interface Argument extends Option {
  argumentKey: string
  required: boolean
}

export type Args = { [K: string]: any }

export type ActionFunction = (args: Args, command: Command) => void

interface CommandOptions {
  name: string
  description?: string
  options?: Option[]
  arguments?: Argument[]
  action?: ActionFunction
  children?: Command[]
  parent?: Command | null
}

class Command {
  public name: string
  public description: string
  public options: Option[]
  public action: ActionFunction
  public children: Command[]
  public arguments: Argument[]
  public parent: Command | null

  constructor (command: CommandOptions) {
    this.action = command.action || (() => {})
    this.children = command.children || []
    this.description = command.description || ''
    this.options = command.options || []
    this.parent = command.parent || null
    this.arguments = command.arguments || []
    this.name = command.name
  }

  option (flagExpression: string, description: string) {
    this.options.push({
      flagExpression,
      description
    })

    return this
  }

  argument (flagExpression: string, description: string) {
    const parsedArgument = parseArgument(flagExpression)

    if (!parsedArgument) {
      console.log(`error on parsing argument: ${flagExpression}`)
      process.exit(1)
    }

    this.arguments.push({
      flagExpression,
      description,
      ...parsedArgument
    })

    return this
  }
}

export default Command
