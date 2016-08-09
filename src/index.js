import updateNotifier from 'update-notifier'
import minimist from 'minimist'
import chalk from 'chalk'
import { getConfig } from './config'
import { menus, addHelpMenu, addOption } from './help'

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
    this.options = {}
    this.optionsArgs = []
    this.optionsRequired = []
    this.optionsBoolean = []
    this.hasSubcommands = false
  }

  command (data) {
    if (data.subcommands && !this.hasSubcommands) {
      this.hasSubcommands = true
    }

    // TODO: check for duplicate commands

    if (data.options) {
      data.options.forEach((o) => this.option(o))
    }

    this.commands[data.command] = data
    if (data.subcommands && Array.isArray(data.subcommands)) {
      data.subcommands.forEach((cmd) => {
        cmd.command = `${data.command}:${cmd.command}`
        this.command(cmd)
      })

      delete this.commands[data.command].subcommands
    }

    return this
  }

  option (data) {
    const name = [
      data.short ? `-${data.short}` : null,
      data.long ? `--${data.long}` : null
    ].filter(Boolean).join(', ')

    // TODO: check for duplicate options
    this.options[name] = data.description

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
    const boolean = ['h', 'help', 'v', 'version'].concat(this.optionsBoolean)
    const argv = minimist(process.argv.slice(2), { boolean })

    const cmd = this.commands[argv._[0]]

    if (!cmd) {
      return Promise.reject(this.config.invalidCommand(argv._))
    }

    if (cmd.action) {
      const opts = {}
      this.optionsArgs.forEach((arg) => {
        opts[arg] = argv[arg] || false
      })

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

    // if (!this.commands['help']) {
    //   addHelpMenu({
    //     command: 'help',
    //     description: 'show help menu for a command'
    //   })
    // }
    //
    // addOption({
    //   name: '-h, --help',
    //   description: 'show help menu for a command'
    // })
    //
    // addOption({
    //   name: '-v, --version',
    //   description: 'show version number'
    // })
    //
    // /* allow help flag on any command */
    // if (this.argv.help || this.argv.h) {
    //   this.argv._.unshift('help')
    // }
    //
    // /* show version number */
    // if (this.argv.version || this.argv.v) {
    //   return console.log(`v${this.config.version}` || 'no version specified')
    // }
    //
    // const cmd = this.argv._[0]
    //
    // if (cmd === 'help' || cmd === undefined) {
    //   return this._help(this.argv)
    // } else if (this.commands[cmd]) {
    //   return this.commands[cmd].action({
    //     raw: this.argv,
    //     command: cmd
    //   })
    // } else {
    //   return Promise.reject(this.config.invalidCommand())
    // }
  }

  // _help () {
  //   const cmd = this.argv._[1] || '_default'
  //
  //   if (this.config.prependMenu) {
  //     const withPadding = this.config.prependMenu.split('\n').map((line) => `${new Array(3).join(' ')}${line}`).join('\n')
  //     /* use stdout to prevent an extra newline */
  //     process.stdout.write(withPadding)
  //   }
  //
  //   console.log(menus[cmd](this.config))
  // }
}
