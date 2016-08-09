import chalk from 'chalk'
import deepAssign from 'deep-assign'

const defaults = {
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
  return deepAssign({}, defaults, opts)
}
