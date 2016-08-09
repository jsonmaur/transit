# Transit

> More docs coming soon!

## Getting Started

```bash
npm install --save transit
```

## Example

```bash
$ pizza
# or
$ pizza --help
```

![menu](/assets/menu.png?raw=true)

```bash
$ pizza help info
# or
$ pizza info --help
```

![submenu](/assets/submenu.png?raw=true)


```javascript
const Transit = require('transit')

const cli = new Transit({
  name: 'pizza',
  version: '1.0.0',
  prependMenu: '\n🍕 🍕 🍕 🍕 🍕 🍕\n'
})

cli.option({
  short: 'o',
  long: 'order-type',
  description: 'whether order is pickup or delivery'
})

cli.command({
  command: 'order',
  description: 'order a pizza',
  options: [
    {
      short: 'p',
      long: 'pepporoni',
      description: 'add pepporoni to your order'
    },
    {
      short: 's',
      long: 'sausage',
      description: 'add sausage to your order'
    }
  ],
  action: (argv) => {
    // action to run for command
    // should return a promise
  }
})

cli.command({
  command: 'info',
  description: 'show restaurant information',
  subcommands: [
    {
      command: 'menu',
      description: 'list our menu options',
      action: (argv) => { /* ... */ }
    },
    {
      command: 'location',
      description: 'list our locations',
      action: (argv) => { /* ... */ }
    }
  ]
})

cli.run()
```
