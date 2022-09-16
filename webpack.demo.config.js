const path = require("path")

module.exports = {
  devServer: {
    "static": "./demo",
  },
  entry: {
    index: "./demo/demo.js"
  },
  mode: "development",
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
    filename: "bundle.demo.js",
    path: path.resolve(__dirname, "demo"),
  }
}