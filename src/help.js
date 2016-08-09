import chalk from 'chalk'

export default function () {
  const menu = this.argv._[1] || '_default'

  const prepend = (str) => {
    const split = str.split('\n')

    /* add padding to left side */
    const withPadding = split.map((line) => {
      return `${new Array(3).join(' ')}${line}`
    }).join('\n')

    console.log(withPadding)
  }

  if (this.config.prependMenu && menu === '_default') {
    prepend(this.config.prependMenu)
  } else if (this.config.prependMenuAll) {
    prepend(this.config.prependMenuAll)
  }

  if (menu === '_default' || !this.commands[menu]) {
    title('Usage:')
    text(this.config.name, `<command>${this.hasSubcommands ? ':<subcommand>' : ''}`, '[options]')

    console.log()

    text(chalk.dim('For further info about a command:'))
    text(this.config.name, 'help <command>', chalk.dim('or'), this.config.name, '<command> --help')

    console.log()

    title('Commands:')
    Object.keys(this.commands).forEach((cmd) => {
      const sub = Boolean(cmd.match(/:/))
      description(cmd, this.commands[cmd].description, sub)
    })

    console.log()

    title('Options:')
    Object.keys(this.optionsGlobal).forEach((opt) => {
      description(opt, this.optionsGlobal[opt])
    })
  } else {
    const cmd = this.commands[menu]
    console.log()

    title('Usage:')
    text(this.config.name, `${cmd.command}${cmd.subcommands ? ':<subcommand>' : ''}`, '[options]')

    if (cmd.description) {
      console.log()
      title('Description:')
      text(cmd.descriptionLong || cmd.description)
    }

    if (cmd.options) {
      console.log()
      title('Options:')
      Object.keys(this.optionsLocal).forEach((opt) => {
        description(opt, this.optionsLocal[opt])
      })
    }

    if (cmd.subcommands) {
      console.log()
      title('Subcommands:')
      cmd.subcommands.forEach((cmd) => {
        description(cmd.command, cmd.description)
      })
    }
  }

  /* trailing blank line */
  console.log()
}

export function title (str) {
  console.log(`  ${chalk.underline(str)}\n`)
}

export function text (...str) {
  console.log(`    ${str.join(' ')}`)
}

export function description (name, desc, sub = false) {
  const padding = 25
  const paddingLeft = sub ? padding - 3 : padding
  const fill = new Array(paddingLeft - name.length - 1).join('.')

  console.log(`    ${sub ? chalk.dim.gray('└─ ') : ''}${name} ${chalk.dim.gray(fill)} ${desc}`)
}
