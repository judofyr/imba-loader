# imba-loader

[Imba](https://github.com/somebee/imba) loader for Webpack.

## Usage

Install imba-loader:

```
$ npm install --save imba-loader
```

Hook it up in `webpack.config.js`:

```json
module.exports = {
  resolve: {
    extensions: ['', '.js', '.imba']
  },
  module: {
    loaders: [
      { test: /\.imba/, loader: 'imba-loader' }
    ]
  }
};
```

