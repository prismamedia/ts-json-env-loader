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
Keys are uppercased
Keys are prefixed by the fileName
Keys from multi level json are prefixed the parent key.

for file test.json 

```json
{
  "config_1": "a",
  "LEVEL_2": {
    "CONFIG_1": "aa",
    "CONFIG_2": "bb"
  }
}
```

Will load as

```
TEST_CONFIG_1="a"
TEST_LEVEL_2_CONFIG_1="aa"
TEST_LEVEL_2_CONFIG_2="bb"
```

Loading can be asynchronous using `loadEnv`
```javascript
import { loadEnv } from '@prismamedia/ts-json-env-loader'
await loadEnv({ folder: "/path/to/json/folder"})
```

By default, non json file are ignored, you can raise an exception in those cases using the `strict` option
By default, duplicate entries are ignored, you can raise an exception in those cases using the `strict` option

Files can be filtered by name using a regex with the `excludeFolder` or `includeFolder` options
Entries can be filtered by (unprefixed) name using a regex with the `excludeEntry` or `includeEntry` options

```javascript
import { loadEnvSync } from '@prismamedia/ts-json-env-loader'
loadEnvSync({ 
  folder: "/path/to/json/folder",
  strict: true,
  includeFolder: /^[_A-Za-z][_0-9A-Za-z]*$/,
  excludeFolder: /^[_A-Za-z][_0-9A-Za-z]*$/,
  includeEntry: /^[_A-Za-z][_0-9A-Za-z]*$/,
  excludeEntry: /^[_A-Za-z][_0-9A-Za-z]*$/,
  onDuplicateEntry: 'overwrite' | 'ignore' | 'throw'
})
```