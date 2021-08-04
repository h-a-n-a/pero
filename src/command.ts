import { kebabToCamelCase, parseArgument, parseFlagExp } from './utils'
import Renderer from './renderer'

interface Flag {
  type: 'flag'
  name: string
  alias: string | null
  required: boolean
  argumentKey: string | null
}

export interface Option {
  rawFlagExp: string
  flagExp: string
  description: string
  flag: Flag
}

interface Argument {
  type: 'argument'
  flagExp: string
  description: string
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
  public desc: string
  public options: Option[]
  public action: ActionFunction
  public children: Command[]
  public arguments: Argument[]
  public parent: Command | null

  public flagArgumentMap: Record<string, Flag | Argument> = {}

  constructor (command: CommandOptions) {
    this.action = command.action || (() => {})
    this.children = command.children || []
    this.desc = command.description || ''
    this.options = command.options || []
    this.parent = command.parent || null
    this.arguments = command.arguments || []
    this.name = command.name
  }

  description (desc: string) {
    this.desc = desc
    return this
  }

  option (flagExp: string, description: string) {
    const parsedFlag = parseFlagExp(flagExp)
    const { flag, flagAlias, required, argumentKey } = parsedFlag

    if (!flag) {
      console.log(`option registration error: option \`${flagExp}\` is not valid, short-flag is required`)
      process.exit(1)
    }

    if (this.flagArgumentMap[flag] || (flagAlias && this.flagArgumentMap[flagAlias])) {
      console.log(`option registration error: flag in option \`${flagExp}\` conflicts with other option(s)`)
      process.exit(1)
    }

    const option = {
      rawFlagExp: flagExp,
      flagExp: `-${flag}${flagAlias ? `, --${flagAlias}` : ''} ${
        argumentKey
          ? required ? `<${argumentKey}>` : `[${argumentKey}]`
          : ''}`,
      description,
      flag: {
        type: 'flag',
        name: flag,
        alias: flagAlias,
        required,
        argumentKey
      }
    } as const

    // record flag in hashmap
    this.flagArgumentMap[flag] = option.flag
    flagAlias && (this.flagArgumentMap[flagAlias] = option.flag)
    flagAlias && (this.flagArgumentMap[kebabToCamelCase(flagAlias)] = option.flag)

    this.options.push(option)

    return this
  }

  argument (flagExp: string, description: string) {
    const parsedArgument = parseArgument(flagExp)

    if (!parsedArgument) {
      console.log(`argument registration error: error on parsing argument: ${flagExp}`)
      process.exit(1)
    }

    const argument = {
      type: 'argument',
      flagExp,
      description,
      ...parsedArgument
    } as const

    this.flagArgumentMap[parsedArgument.argumentKey] = argument

    this.arguments.push(argument)

    this.arguments.sort((a1, a2) => {
      if (a1.required && !a2.required) return -1

      if (!a1.required && a2.required) return 1

      return 0
    })

    return this
  }

  help () {
    new Renderer(this).render()
  }
}

export default Command
