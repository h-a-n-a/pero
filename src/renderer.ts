import table from 'text-table'

import Command, { SingleCommand } from './command'

class Renderer {
  constructor (public command: Command, public config: SingleCommand) {}

  render () {
    this.renderUsage()
    this.renderCommand()
    this.renderOption()
  }

  renderOption () {
    const options = this.config.options

    const optionTable = table([
      ...options.map(option => {
        return [
          option.flagExpression,
          option.description
        ]
      })
    ])

    if (options.length) {
      console.log('Options:')
      console.log(optionTable)
    }
  }

  renderUsage () {
    const config = this.config

    const commandName = (() => {
      let name = ''
      let internalConfig = config
      while (true) {
        name = `${internalConfig.name}${name ? ` ${name}` : ''}`
        if (!internalConfig.parent) break

        internalConfig = internalConfig.parent
      }
      return name
    })()

    let usage = `Usage: ${commandName}`

    if (config.children?.find(ch => ch.options.length)) {
      usage += ' <command>'
    }

    console.log(usage)
    this.renderDivider()
  }

  renderCommand () {
    const config = this.config

    const commandList = config.children?.map(ch => {
      if (ch.options.length) {
        return [ch.name, ch.description].filter(Boolean)
      }
      return null
    }).filter(Boolean) as string[][]

    if (commandList.length) {
      console.log('Commands:')
      console.log(table(commandList))
      this.renderDivider()
    }
  }

  renderDivider () {
    console.log()
  }
}

export default Renderer
