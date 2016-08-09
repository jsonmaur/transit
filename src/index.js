import updateNotifier from 'update-notifier'
import minimist from 'minimist'
import { getConfig } from './config'
import help from './help'

export default class Transit {
  constructor (opts) {
    this.config = getConfig(opts)

    if (!this.config.name) throw new Error('"name" is required!')
    if (!this.config.version) throw new Error('"version" is required!')

    if (this.config.checkForUpdates) {
      updateNotifier({
        pkg: {
          name: this.config.name,
          version: this.config.version
        }
      }).notify()
    }

    this.commands = {}
    // this.options = {}
    this.optionsBoolean = []
    this.optionsArgs = []
    this.optionsRequired = []
    this.optionsGlobal = {}
    this.optionsLocal = {}

    this.hasSubcommands = false
  }

  command (data) {
    if (data.subcommands && !this.hasSubcommands) {
      this.hasSubcommands = true
    }

    // TODO: check for duplicate commands

    if (data.options) {
      data.options.forEach((o) => this.option(o, false))
    }

    this.commands[data.command] = data
    if (data.subcommands && Array.isArray(data.subcommands)) {
      data.subcommands.forEach((cmd) => {
        cmd.command = `${data.command}:${cmd.command}`
        this.command(cmd)
      })
    }

    return this
  }

  option (data, isGlobal = true) {
    const name = [
      data.short ? `-${data.short}` : null,
      data.long ? `--${data.long}` : null
    ].filter(Boolean).join(', ')

    // TODO: check for duplicate options

    isGlobal
      ? this.optionsGlobal[name] = data.description
      : this.optionsLocal[name] = data.description

    data.short && this.optionsArgs.push(data.short)
    data.long && this.optionsArgs.push(data.long)

    if (data.required) {
      const combined = [data.short, data.long]
        .filter(Boolean).join('|')
      this.optionsRequired.push(combined)
    }

    if (data.boolean) {
      data.short && this.optionsBoolean.push(data.short)
      data.long && this.optionsBoolean.push(data.long)
    }

    return this
  }

  run () {
    /* add predefined commands and options */
    this.command({
      command: 'help',
      description: 'show help menu for a command'
    })
    this.option({
      short: 'h',
      long: 'help',
      description: 'show help menu for a command',
      boolean: true
    })
    this.option({
      short: 'v',
      long: 'version',
      description: 'show version number',
      boolean: true
    })

    const argv = minimist(process.argv.slice(2), {
      boolean: this.optionsBoolean
    })
    this.argv = argv

    /* show version number */
    if (argv.version || argv.v) {
      return console.log(`v${this.config.version}` || 'no version specified')
    }

    const cmd = this.commands[argv._[0]]

    /* allow help flag on all commands or when command has subcommands */
    if (argv.help || argv.h || (cmd && !cmd.action)) {
      argv._.unshift('help')
    }
    /* show help menus */
    if (argv._[0] === 'help' || argv._[0] === undefined) {
      return help.apply(this)
    }

    if (!cmd) {
      return Promise.reject(this.config.invalidCommand(argv._))
    }

    if (cmd.action) {
      const opts = {}
      this.optionsArgs.forEach((arg) => {
        opts[arg] = argv[arg] || false
      })

      /* validate required options */
      let missingKeys
      this.optionsRequired.forEach((opt) => {
        const split = opt.split('|')

        const isValid = Boolean(split.find((o) => {
          return opts[o]
        }))

        if (!isValid) missingKeys = split
      })

      if (missingKeys) {
        return Promise.reject(this.config.missingOptions(missingKeys))
      }

      const vals = argv._.slice(1)
      return cmd.action({ _: vals, opts })
    }
  }
}
