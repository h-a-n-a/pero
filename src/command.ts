import { RouteOptions, Route, getRoute } from './route'
import { getEntryDefault } from './exec'

interface CommandOptions extends RouteOptions {
  /**
   * CLI Name
   */
  name: string
}

interface CommandConfigOption {
  flagExpression: string
  description: string
  defaultValue?: any
}

type ActionFunction = () => void

type CommandFunction = (option: Command['option']) => ActionFunction

export interface CommandConfig {
  name: string
  description: string
  options: CommandConfigOption[]
  action: ActionFunction
  children: CommandConfig[]
}

const createCommandConfig = (commandName: string): CommandConfig => ({
  name: commandName,
  description: '',
  options: [],
  action: () => {},
  children: []
})

const DEFAULT_CLI_NAME = 'pero-cli'

class Command {
  private readonly routes: Route[]

  private readonly registeredCommands: CommandConfig
  private registeringCommand: CommandConfig | null = null

  constructor (private options: CommandOptions) {
    this.routes = getRoute({
      root: options.root,
      ignorePattern: options.ignorePattern
    })

    this.registeredCommands = createCommandConfig(this.options.name || DEFAULT_CLI_NAME)
    this.registeringCommand = this.registeredCommands
    this.registerRoutes(this.routes)
  }

  private registerRoutes (routes: Route[]) {
    for (const r of routes) {
      if (r.isDir) {
        const registeredCommands = createCommandConfig(r.name)

        // register child command
        this.registeringCommand?.children.push(registeredCommands)
        // switch current working command
        this.registeringCommand = registeredCommands

        this.registerRoutes(r.children)
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

  option (flagExpression: string, description: string, defaultValue?: any) {
    const currentCommand = this.registeringCommand

    currentCommand?.options.push({
      flagExpression,
      description,
      defaultValue
    })
  }

  parse (argv = process.argv) {
    argv = argv.slice(2)
    console.log(argv)
  }

  static init (options: CommandOptions) {
    return new Command(options)
  }
}

export default Command
