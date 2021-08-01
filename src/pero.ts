import mri, { Argv } from 'mri'

import Renderer from './renderer'
import Command, { ActionFunction } from './command'
import { RouteOptions, Route, getRoute } from './route'
import { getEntryDefault } from './exec'
import { kebabKeyToCamelCase } from './utils'

interface PeroOptions extends RouteOptions {
  /**
   * CLI Name
   */
  name?: string
}

type CommandFunction = (command: Command) => ActionFunction

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

    this.registeredCommands = new Command({
      name: this.options.name || DEFAULT_CLI_NAME
    })
    this.registeringCommand = this.registeredCommands
    this.registerCommand(this.routes)
  }

  private registerCommand (routes: Route[]) {
    const currentWorkingCommand = this.registeringCommand

    for (const r of routes) {
      if (r.isDir) {
        const registeredCommands = new Command({
          name: r.name
        })

        registeredCommands.parent = this.registeringCommand

        // register child command
        this.registeringCommand?.children &&
          this.registeringCommand.children.push(registeredCommands)

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
         currentCommand
        ])
      }
    }
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

    let argument: string[] = []

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

      // if arguments exist, make target command an argument, and bailout with the current command
      if (registeredCommands.arguments.length) {
        argument = commands.slice()
        return registeredCommands
      }

      console.log(`Command ${commands.join(' ')} not found`)
      process.exit(1)
    }

    const targetCommand = findMatchedCommands(this.registeredCommands, commands)

    const mergedArguments = targetCommand.arguments.reduce<{
      [K: string]: string
    }>((acc, curr, index) => {
      return {
        ...(acc || {}),
        [curr.argumentKey]: argument[index]
      }
    }, {})

    targetCommand.action({
      ...options,
      ...kebabKeyToCamelCase(options),
      ...mergedArguments
    }, targetCommand)
  }

  help (command?: Command) {
    new Renderer(command || this.registeredCommands).render()
  }

  static init (options: PeroOptions) {
    return new Pero(options)
  }
}

export { Pero }

export default Pero
