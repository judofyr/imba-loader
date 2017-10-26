# imba-loader (deprecated)

[Imba](https://github.com/somebee/imba) loader for Webpack.

**NOTE**: Imba v1.0.0 ships with its own Webpack loader and thus this
package is deprecated. See <https://github.com/somebee/imba#webpack-config>
for how to use it.

## Usage

Install imba-loader:

```
$ npm install --save imba-loader
```

Hook it up in `webpack.config.js`:

```javascript
module.exports = {
  resolve: {
    extensions: ['.imba', '.js']
  },
  module: {
    loaders: [
      { test: /\.imba/, loader: 'imba-loader' }
    ]
  }
};
```

