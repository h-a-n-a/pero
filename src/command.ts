import { RouteOptions, Route, getRoute } from './route'
import { getEntryDefault } from './exec'

interface CommandOptions extends RouteOptions {}

interface CommandConfigOption {
  name: string
  description?: string
  defaultValue?: any
}

type CommandFunction = (option: Command['option']) => () => void

interface CommandConfig {
  name: string
  options: CommandConfigOption[]
  commandFunction: ReturnType<CommandFunction>
  children: CommandConfig[]
}

const createCommandConfig = (commandName: string): CommandConfig => ({
  name: commandName,
  options: [],
  commandFunction: () => {},
  children: []
})

class Command {
  private readonly routes: Route[]

  private commandConfig: CommandConfig = createCommandConfig('')
  private registeringCommand: CommandConfig

  constructor (options: CommandOptions) {
    this.routes = getRoute({
      root: options.root,
      ignorePattern: options.ignorePattern
    })

    this.registeringCommand = this.commandConfig
    this.registerRoutes(this.routes)
  }

  private registerRoutes (routes: Route[]) {
    for (const r of routes) {
      if (r.isDir) {
        const commandConfig = createCommandConfig(r.name)

        // register child command
        this.registeringCommand.children.push(commandConfig)
        // switch current working command
        this.registeringCommand = commandConfig

        this.registerRoutes(r.children)
        continue
      }

      const defaultExport = getEntryDefault(r.path) as CommandFunction

      const currentCommand = this.registeringCommand
      currentCommand.commandFunction = defaultExport.apply(this, [
        this.option.bind(this)
      ])
    }
  }

  option (syntax: string, description?: string, defaultValue?: any) {
    const currentCommand = this.registeringCommand

    currentCommand.options.push({
      name: syntax,
      description,
      defaultValue
    })
  }

  static init (options: CommandOptions) {
    return new Command(options)
  }
}

export default Command
