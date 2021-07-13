import table from 'text-table'

import { CommandConfig } from './command'

class Renderer {
  constructor (public config: CommandConfig) {}

  render () {
    this.renderUsage()
    this.renderDivider()
    this.renderCommand()
    this.renderDivider()
    this.renderOption()
  }

  renderOption () {
    const options = this.config.options

    console.log('Options:')
    const optionTable = table([
      ...options.map(option => {
        return [
          option.flagExpression,
          option.description
        ]
      })
    ])
    console.log(optionTable)
  }

  renderUsage () {
    const config = this.config
    let usage = `Usage: ${config.name}`

    if (config.children?.find(ch => ch.options.length)) {
      usage += ' <command>'
    }

    console.log(usage)
  }

  renderCommand () {
    const config = this.config

    let commands = 'Commands:\n'

    const commandList = config.children?.map(ch => {
      if (ch.options.length) {
        return [ch.name, ch.description].filter(Boolean)
      }
      return null
    }).filter(Boolean) as string[][]

    commands += table(commandList)

    console.log(commands)
  }

  renderDivider () {
    console.log()
  }
}

const config = {
  name: 'pero',
  options: [
    {
      flagExpression: '-x',
      description: '123123'
    },
    {
      flagExpression: '-y',
      description: '1231235432423'
    }
  ],
  children: [
    {
      name: 'init',
      description: 'abc',
      options: [
        {
          flagExpression: '-x',
          description: '123123'
        },
        {
          flagExpression: '-y',
          description: '1231235432423'
        }
      ],
      children: []
    }
  ]
} as unknown as CommandConfig

// new Renderer().renderUsage(config)
const renderer = new Renderer(config)
renderer.render()

export default Renderer
