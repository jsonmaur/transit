import minimist from 'minimist'
import chalk from 'chalk'

export default class Transit {
  constructor (opts) {
    this.cmds = {}

    /* parse arguments into config */
    this.argv = minimist(process.argv.slice(2), {
      boolean: ['h', 'help', 'v', 'version']
    })

    /* allow help flag on any command */
    if (this.argv.help || this.argv.h) {
      this.argv._.unshift('help')
    }

    /* show version number */
    if (this.argv.version || this.argv.v) {
      return console.log(`v${opts.pkg.version}`)
    }

    /* invalid command response */
    const invalid = () => console.error(chalk.red(`"${this.argv._.join(' ')}" is not a valid command`))
    this.invalidCommand = opts.invalidCommand || invalid
  }

  command (opts) {
    this.cmds[opts.command] = opts
  }

  run () {
    const cmd = this.argv._[0]

    if (cmd === 'help' || cmd === undefined) {
      return console.log('HELP')
    } else if (this.cmds[cmd]) {
      return this.cmds[cmd].action(this.argv)
    } else {
      return Promise.reject(this.invalidCommand())
    }
  }
}
