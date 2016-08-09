import chalk from 'chalk'
import deepAssign from 'deep-assign'

const defaults = {
  pkg: {},
  checkForUpdates: true,
  invalidCommand: (cmds) => {
    const msg = `"${cmds.join(' ')}" is not a valid command`
    console.error(chalk.red(msg))
  },
  missingOptions: (opts) => {
    const msg = `Missing options: ${opts.join('/')}`
    console.error(chalk.red(msg))
  }
}

export function getConfig (opts) {
  const config = deepAssign({}, defaults, opts)

  config.name = config.pkg.name || config.name
  config.version = config.pkg.version || config.version

  return config
}
