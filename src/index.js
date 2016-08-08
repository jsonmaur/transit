import minimist from 'minimist'
import chalk from 'chalk'
import { menus, addHelpMenu, addOption } from './help'

export default class Transit {
  constructor (opts) {
    this.opts = opts
    this.cmds = {}

    /* parse arguments into config */
    this.argv = minimist(process.argv.slice(2), {
      boolean: ['h', 'help', 'v', 'version']
    })

    /* invalid command response */
    const invalid = () => console.error(chalk.red(`"${this.argv._.join(' ')}" is not a valid command`))
    this.invalidCommand = opts.invalidCommand || invalid
  }

  command (data) {
    this.cmds[data.command] = data
    addHelpMenu(data, this.opts)

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
      return console.log(`v${this.opts.version}` || 'no version specified')
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

    if (this.opts.prependMenu) {
      console.log(this.opts.prependMenu)
    }

    console.log(menus[cmd](this.opts))
  }
}
