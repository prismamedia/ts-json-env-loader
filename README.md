#Json env loader
Small module that loads data from json files (like vault secrets) into [`process.env`](https://nodejs.org/docs/latest/api/process.html#process_process_env). 

Inspired by [`dotenv`](https://raw.githubusercontent.com/motdotla/dotenv)

## Install

```bash
npm install @prismamedia/ts-json-env-loader
```
Or
```bash
yarn add @prismamedia/ts-json-env-loader
```

## Usage
Add your json config file to a folder accessible by your app
As early as possible in your application, import and call the module:

```javascript
import { loadEnvSync } from '@prismamedia/ts-json-env-loader'
loadEnvSync({ folder: "/path/to/json/folder"})
import express from 'express'
```

key from multi level json are prefixed bu the parent key.
```json
{
  "CONFIG_1": "a",
  "LEVEL_2": {
    "CONFIG_1": "aa",
    "CONFIG_2": "bb"
  }
}
```

Will load as

```
CONFIG_1="a"
LEVEL_2_CONFIG_1="aa"
LEVEL_2_CONFIG_2="bb"
```

Loading can be asynchronous using `loadEnvSync`
```javascript
import { loadEnv } from '@prismamedia/ts-json-env-loader'
await loadEnv({ folder: "/path/to/json/folder"})
```

By default, non json file are ignored, you can raise an exception in those cases using the `strict` option

File can be filtered by name using a regex with the `exclude` or `include` options

```javascript
import { loadEnvSync } from '@prismamedia/ts-json-env-loader'
loadEnvSync({ 
  folder: "/path/to/json/folder",
  strict: true,
  include: /^[_A-Za-z][_0-9A-Za-z]*$/,
  exclude: /^[_A-Za-z][_0-9A-Za-z]*$/,
})
```


### Preload

You can use the `--require` (`-r`) [command line option](https://nodejs.org/api/cli.html#-r---require-module) to preload json-env-loader. By doing this, you do not need to require and load dotenv in your application code.

```bash
$ node -r @prismamedia/ts-json-env-loader/loadEnvSync your_script.js
```

You can use environment variables to set configuration options. Configuration from code will precede these.

```bash
$ JSONENVLOADER_CONFIG_<OPTION>=value node -r @prismamedia/ts-json-env-loader/loadEnvSync your_script.js
```

```bash
$ JSONENVLOADER_CONFIG_FOLDER="/path/to/folder" node -r dotenv/config your_script.js dotenv_config_path=/custom/path/to/.env
```
