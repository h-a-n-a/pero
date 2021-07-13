import assert from 'assert'
import mri, { Argv } from 'mri'
import { RouteOptions, Route, getRoute } from './route'
import { getEntryDefault } from './exec'

interface CommandOptions extends RouteOptions {
  /**
   * CLI Name
   */
  name: string
}

interface SingleCommandOption {
  flagExpression: string
  description: string
}

type ActionFunction = () => void

type CommandFunction = (option: Command['option']) => ActionFunction

export interface SingleCommand {
  name: string
  description: string
  options: SingleCommandOption[]
  action: ActionFunction
  children: SingleCommand[]
}

const createSingleCommand = (commandName: string): SingleCommand => ({
  name: commandName,
  description: '',
  options: [],
  action: () => {},
  children: []
})

const DEFAULT_CLI_NAME = 'pero-cli'

class Command {
  private readonly routes: Route[]

  private readonly registeredCommands: SingleCommand
  private registeringCommand: SingleCommand | null = null

  constructor (private options: CommandOptions) {
    this.routes = getRoute({
      root: options.root,
      ignorePattern: options.ignorePattern
    })

    this.registeredCommands = createSingleCommand(this.options.name || DEFAULT_CLI_NAME)
    this.registeringCommand = this.registeredCommands
    this.registerCommand(this.routes)
  }

  private registerCommand (routes: Route[]) {
    const currentWorkingCommand = this.registeredCommands
    for (const r of routes) {
      if (r.isDir) {
        const registeredCommands = createSingleCommand(r.name)

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
    console.log('currentCommand', currentCommand)

    currentCommand?.options.push({
      flagExpression,
      description
    })
  }

  parse (argv = process.argv) {
    argv = argv.slice(2)
    const parsedArgv = mri(argv)
    const commands = parsedArgv._

    const findMatchedCommands = (registeredCommands: SingleCommand, commands: Argv['_']): SingleCommand => {
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

      assert(false, 'Command not found')
    }

    const targetCommand = findMatchedCommands(this.registeredCommands, commands)

    console.log(targetCommand)
  }

  static init (options: CommandOptions) {
    return new Command(options)
  }
}

export default Command
