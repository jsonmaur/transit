# Transit

> More docs coming soon!

## Getting Started

```bash
npm install --save transit
```

```javascript
const pkg = require('./package.json')

const cli = new Transit({
  name: pkg.name,
  version: pkg.version
}).option({
  short: 'p',
  long: 'port',
  description: 'specify port for server'
}).option({
  short: 'd',
  long: 'debug',
  description: 'turn on debug mode',
  boolean: true
}).command({
  command: 'hi',
  description: 'This is the hi description',
  options: [{
    short: 'a',
    long: 'apple',
    description: 'I like apples a lot'
  }],
  action: (argv) => {
    // action to run for command
    // should return a promise
  }
}).command({
  command: 'sub',
  description: 'this is so sub',
  subcommands: [
    {
      command: 'one',
      description: 'sub one',
      action: (argv) => {
        console.log(argv)
        console.log('yo1')
      }
    },
    {
      command: 'two',
      description: 'sub two',
      action: (argv) => {
        console.log('yo2')
      }
    }
  ]
})

cli.run().then((res) => {
  console.log(res) // result of command
}).catch((err) => {
  console.error(err) // any errors
})
```
