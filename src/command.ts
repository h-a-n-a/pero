import { parseArgument, parseFlagExp } from './utils'
import Renderer from './renderer'

interface Flag {
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

  private flagHashMap: Record<string, boolean> = {}

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
    const { flag, flagAlias, required, argumentKey } = parseFlagExp(flagExp)

    if (!flag) {
      console.log(`option ${flagExp} is not valid`)
      process.exit(1)
    }

    if (this.flagHashMap[flag] || (flagAlias && this.flagHashMap[flagAlias])) {
      console.log(`flag in option ${flagExp} conflicts with other option(s)`)
      process.exit(1)
    }

    // record flag in hashmap
    this.flagHashMap[flag] = true
    flagAlias && (this.flagHashMap[flagAlias] = true)

    this.options.push({
      rawFlagExp: flagExp,
      flagExp: `-${flag}${flagAlias ? `, --${flagAlias}` : ''} ${
        argumentKey
          ? required ? `<${argumentKey}>` : `[${argumentKey}]`
          : ''}`,
      description,
      flag: {
        name: flag,
        alias: flagAlias,
        required,
        argumentKey
      }
    })

    return this
  }

  argument (flagExp: string, description: string) {
    const parsedArgument = parseArgument(flagExp)

    if (!parsedArgument) {
      console.log(`error on parsing argument: ${flagExp}`)
      process.exit(1)
    }

    this.arguments.push({
      flagExp,
      description,
      ...parsedArgument
    })

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
