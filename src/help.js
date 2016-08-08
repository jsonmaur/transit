import chalk from 'chalk'

export let commands = {}
export let options = {}

export let menus = {
  _default: (data) => `
  ${chalk.underline('Usage:')}

    ${data.name} <command>${data.hasSubcommands ? ':<subcommand>' : ''} [options]

    ${chalk.dim('For further info about a command:')}
    ${data.name} help <command> ${chalk.dim('or')} ${data.name} <command> --help

  ${chalk.underline('Commands:')}

${Object.keys(commands).map((cmd) => {
  return '    ' + spaceOut(cmd, commands[cmd])
}).join('\n')}

  ${chalk.underline('Options:')}

${Object.keys(options).map((opt) => {
  return '    ' + spaceOut(opt, options[opt])
}).join('\n')}
  `
}

export function addHelpMenu (data, opts) {
  commands[data.command] = data.description

  menus[data.command] = () => {
    const cmd = data

    const description = (cmd.descriptionLong || cmd.description)
      ? `
  ${chalk.underline('Description:')}

    ${cmd.descriptionLong || cmd.description || 'no description'}\n` : ''

    const options = cmd.options
      ? `
  ${chalk.underline('Options:')}

${Object.keys(cmd.options).map((opt) => {
  return '    ' + spaceOut(opt, cmd.options[opt])
}).join('\n')}\n` : ''

    return `${description}
  ${chalk.underline('Usage:')}

    ${cmd.usage || `${opts.name} ${cmd.command} [options]`}
  ${options}`
  }
}

export function addOption (data) {
  options[data.name] = data.description
}

export function spaceOut (name, desc) {
  const paddingLeft = 25
  const fill = new Array(paddingLeft - name.length - 1).join('.')

  return `${name} ${chalk.dim(fill)} ${desc}`
}
