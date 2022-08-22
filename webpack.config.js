const path = require('path');

module.exports = {
  devServer: {
    "static": "./demo",
  },
  entry: {
    index: './src/core/Engine.js'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(png|jpe?g)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
  }
}