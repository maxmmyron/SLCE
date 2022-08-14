const path = require("path")

module.exports = {
  mode: "development",
  entry: {
    index: "./demo/demo.js"
  },
  devServer: {
    "static": "./demo",
  },
  output: {
    filename: "bundle.demo.js",
    path: path.resolve(__dirname, "demo"),
  }
}