import deepAssign from 'deep-assign'

const defaults = {
  checkForUpdates: true
}

export function getConfig (opts) {
  return deepAssign({}, defaults, opts)
}
