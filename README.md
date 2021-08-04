<p align="center"><img src="https://i.loli.net/2021/08/02/pCDoP8GVJH42XdB.png" alt="pero logo" width="150"></p>
<h1 align="center">Pero</h1>
<p align="center">Route based CLI tool for creating large scale command line interfaces.</p>
<p align="center">
    <a href="https://github.com/h-a-n-a/pero/actions">
        <img src="https://img.shields.io/github/workflow/status/h-a-n-a/pero/ci.svg" alt="Build Status">
    </a>
    <a href="https://npmjs.com/package/pero">
        <img src="https://img.shields.io/npm/v/pero.svg" alt="npm-v">
    </a>
</p>


## Feature

- Route based, born to create nested CLI commands
- ESBuild driven, really fast to compile your CLI project

## Quick Tour

**This project is under heavy development, APIs might be changed until the stable version is released. [📍Roadmap](https://github.com/h-a-n-a/pero/issues/1)**

### 1. Install

```bash
npm install pero --save
# or use
yarn add pero
```


### 2. Create a folder for CLI

```bash
mkdir src
cd $_ 
touch index.ts # or index.js
```

In the example above, `index.ts` is created in the root of the CLI source folder `src`, 
which is defined as the top-most command in CLI. 

```
.
└── src
    └── index.ts
```


### 3. `vim index.ts`

Add the code and finish your first Pero app!

```typescript
import { Command, Args } from 'pero'

export default (command: Command) => {
  // command registration: define your command here
  command
    .argument('[something]', 'your-description')
    .option('-e', 'environment')

  // action
  return (args: Args) => {
    // do something with user-input args here
    
    command.help() // print help message
  }
}
```

In Pero, we have to two steps in our runtime:

- Step1: Registration, in the outer callback we have `command` passed as the first param, you can utilize this to define your command's arguments or options. 
- Step2: Action, in the inner callback we have `args` passed to, you may do something with user-input args 


### 4. Compile and run

Pero CLI is currently under development, so you need to do the compilation yourself by adding a compiler.

Add `compile.ts` in the root of the whole project, and your project topography will look like this:

```
.
├── src
│   └── index.ts
└── compile.ts
```

Add some code for compilation:

```typescript
import path from 'path'

import { Compiler } from 'pero'

(async () => {
  const compiler = new Compiler({
    outDir: path.resolve(__dirname, './dist'),
    root: path.resolve(__dirname, 'src'),
    name: 'name-your-cli'
  })

  await compiler.compile()
})()
```

Compiled CLI will be emitted to the `outDir` you defined above.

Run the code below, you will get the corresponding help message in the terminal.

```bash
node ./dist/index.js
```


## Advanced Usage


### Nested Command

With the demo project introduced in the Quick Tour section, try to add a new folder under `src` folder,
you will get the nested command right away! This is really cool.

```
.
└── src
    ├── build ## the sub-command we added
    │    └── index.ts
    └── index.ts
```

To trigger the sub-command `build`, do the compilation first and run:

```bash
node ./dist/index.js build
```

You will see anything in the sub-command's action printed to the screen. Great!


## 📍Roadmap

This project is under heavy development, you may refer to [this](https://github.com/h-a-n-a/pero/issues/1) to get the latest update!


## Acknowledgement

Special thanks to @yisar132 for the logo, it's great!

## LICENSE

MIT