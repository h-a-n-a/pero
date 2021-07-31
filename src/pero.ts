import mri, { Argv } from 'mri'

import Renderer from './renderer'
import { RouteOptions, Route, getRoute } from './route'
import { getEntryDefault } from './exec'
import { kebabKeyToCamelCase } from './utils'

interface PeroOptions extends RouteOptions {
  /**
   * CLI Name
   */
  name?: string
}

interface CommandOption {
  flagExpression: string
  description: string
}

export type Argument = { [K: string]: any }

type ActionFunction = (argument: Argument, command: Command) => void

type CommandFunction = (option: Pero['option']) => ActionFunction

export interface Command {
  name: string
  description: string
  options: CommandOption[]
  action: ActionFunction
  children: Command[]
  parent: Command | null
}

const createCommand = (commandName: string): Command => ({
  name: commandName,
  description: '',
  options: [],
  action: () => {},
  children: [],
  parent: null
})

const DEFAULT_CLI_NAME = 'pero-cli'

class Pero {
  private readonly routes: Route[]

  private readonly registeredCommands: Command
  private registeringCommand: Command | null = null

  constructor (private options: PeroOptions) {
    this.routes = getRoute({
      root: options.root,
      ignorePattern: options.ignorePattern
    })

    this.registeredCommands = createCommand(this.options.name || DEFAULT_CLI_NAME)
    this.registeringCommand = this.registeredCommands
    this.registerCommand(this.routes)
  }

  private registerCommand (routes: Route[]) {
    const currentWorkingCommand = this.registeringCommand

    for (const r of routes) {
      if (r.isDir) {
        const registeredCommands = createCommand(r.name)

        registeredCommands.parent = this.registeringCommand

        // register child command
        this.registeringCommand?.children.push(registeredCommands)
        // switch current working command
        this.registeringCommand = registeredCommands

        this.registerCommand(r.children)

        // backtrack to parent
        this.registeringCommand = currentWorkingCommand
        continue
      }

      const defaultExport = (getEntryDefault(r.path) || (() => () => {})) as CommandFunction
      const currentCommand = this.registeringCommand

      if (currentCommand) {
        currentCommand.action = defaultExport.apply(this, [
         this.option.bind(this)
        ])
      }
    }
  }

  option (flagExpression: string, description: string) {
    const currentCommand = this.registeringCommand

    currentCommand?.options.push({
      flagExpression,
      description
    })
  }

  parse (argv = process.argv) {
    argv = argv.slice(2)
    const parsedArgv = mri(argv)
    const commands = parsedArgv._
    const options = (() => {
      const raw = {
        ...parsedArgv
      } as Omit<mri.Argv, '_'>
      delete raw._
      return raw
    })()

    const findMatchedCommands = (registeredCommands: Command, commands: Argv['_']): Command => {
      const targetCommand = commands[0]

      // bailout if command is not exist
      if (!targetCommand) return registeredCommands

      for (const command of registeredCommands.children) {
        // command matched!
        if (command.name === targetCommand) {
          // Switch to next user input command
          return findMatchedCommands(command, commands.slice(1))
        }
      }

      console.log('Command not found')
      process.exit(1)
    }

    const targetCommand = findMatchedCommands(this.registeredCommands, commands)

    targetCommand.action({
      ...options,
      ...kebabKeyToCamelCase(options)
    }, targetCommand)

    new Renderer(this, targetCommand).render()
  }

  static init (options: PeroOptions) {
    return new Pero(options)
  }
}

export type Option = Pero['option']

export default Pero
