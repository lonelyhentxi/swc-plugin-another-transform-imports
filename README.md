# swc-plugin-another-transform-imports

Another wasm plugin for swc, inspired from [babel-plugin-transform-imports](https://www.npmjs.com/package/babel-plugin-transform-imports).

## Installation

```bash
npm install --save-dev swc-plugin-another-transform-imports
# or
yarn add -D swc-plugin-another-transform-imports
```

## Usage

It follows resolving rule of node.js, can be use in `.swcrc`，`webpack.config.js` or `next.config.js` and so on. For Example:

```json
{
  "jsc": {
    "experimental": {
      "plugins": [
        [
          "swc-plugin-another-transform-imports",
          {
            "antd": {
              "transform": "antd/es/${member}",
              "skipDefaultConversion": false,
              "preventFullImport": true,
              "style": "antd/es/${member}/style",
              "memberTransformers": ["dashed_case"]
            },
            "lodash": {
              "transform": "lodash/${member}",
              "preventFullImport": true
            }
          }
        ]
      ]
    }
  }
}
```

Can convert the following lines:

```js
import { Button as MyButton, BackTop } from 'antd';
import { merge } from 'lodash';
```

To:

```js
import MyButton from 'antd/es/button';
import BackTop from 'antd/es/back-top';
import 'antd/es/back-top/style';
import 'antd/es/button/style';
import merge from 'lodash/merge';
```

## Options


| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `transform` | `string` | yes | `undefined` | The library name to use instead of the one specified in the import statement.  ${member} will be replaced with the member, aka Grid/Row/Col/etc. |
| `preventFullImport` | `boolean` | no | `true` | Whether or not to throw when an import is encountered which would cause the entire module to be imported. |
| `skipDefaultConversion` | `boolean` | no | `false` | When set to true, will preserve `import { X }` syntax instead of converting to `import X`. |
| `style` | `string` | no | `false` | The style path of the member, ${member} will be replaced with the member, aka Grid/Row/Col/etc. |
| `memberTransformers` | `Array<MemberTransformer>` | no | [] | Member transformers 

### 1. `type MemberTransformer`

```typescript
type MemberTransformer = "camel_case" | "kebab_case" | "pascal_case" | "snake_case" | "upper_case" | "upper_first" | "lower_case" | "lower_first" | "dashed_case"
```

## Common Issues

Usually upgrading to the latest version of @swc/core and other swc tools will solve the problem, see the following issue for typical solution:

1. [plugin-styled-components crashes with 'Error while importing "env"."__get_transform_plugin_config": unknown import.' ](https://github.com/swc-project/plugins/issues/60)

## Fork & Modify

You can simply fork this plugin, modify its source code to suit your custom needs. For fast validation, you don't necessarily have to publish the modified project, but simply require your wasm file to the project. For example:

```bash
cargo prepublish
```

Then copy your wasm target file, and set your config to:

```js
module.exports = {
  ...,
  "jsc": {
    "experimental": {
      "plugins": [
        [
          require.resolve("./path/to/your-modified-plugin.wasm"),
          {
            ..your options
          }
        ]
      ]
    }
  },
  ...
}
```