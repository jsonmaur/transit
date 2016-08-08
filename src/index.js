import updateNotifier from 'update-notifier'
import minimist from 'minimist'
import chalk from 'chalk'
import { getConfig } from './config'
import { menus, addHelpMenu, addOption } from './help'

export default class Transit {
  constructor (opts) {
    this.config = getConfig(opts)
    this.cmds = {}

    if (this.config.checkForUpdates) {
      updateNotifier({
        pkg: {
          name: this.config.name,
          version: this.config.version
        }
      }).notify()
    }

    this.config.hasSubcommands = false

    /* parse arguments into config */
    this.argv = minimist(process.argv.slice(2), {
      boolean: ['h', 'help', 'v', 'version']
    })

    /* invalid command response */
    const invalid = () => console.error(chalk.red(`"${this.argv._.join(' ')}" is not a valid command`))
    this.invalidCommand = opts.invalidCommand || invalid
  }

  command (data) {
    if (data.subcommands) {
      this.config.hasSubcommands = true
    }

    this.cmds[data.command] = data
    addHelpMenu(data, this.config)

    return this
  }

  option (data) {
    addOption(data)
    return this
  }

  run () {
    if (!this.cmds['help']) {
      addHelpMenu({
        command: 'help',
        description: 'show help menu for a command'
      })
    }

    addOption({
      name: '-h, --help',
      description: 'show help menu for a command'
    })
    
    addOption({
      name: '-v, --version',
      description: 'show version number'
    })

    /* allow help flag on any command */
    if (this.argv.help || this.argv.h) {
      this.argv._.unshift('help')
    }

    /* show version number */
    if (this.argv.version || this.argv.v) {
      return console.log(`v${this.config.version}` || 'no version specified')
    }

    const cmd = this.argv._[0]

    if (cmd === 'help' || cmd === undefined) {
      return this._help(this.argv)
    } else if (this.cmds[cmd]) {
      return this.cmds[cmd].action({
        raw: this.argv,
        command: cmd
      })
    } else {
      return Promise.reject(this.invalidCommand())
    }
  }

  _help () {
    const cmd = this.argv._[1] || '_default'

    if (this.config.prependMenu) {
      const withPadding = this.config.prependMenu.split('\n').map((line) => `${new Array(3).join(' ')}${line}`).join('\n')
      process.stdout.write(withPadding)
    }

    console.log(menus[cmd](this.config))
  }
}
