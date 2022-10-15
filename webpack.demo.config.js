const path = require("path");

module.exports = {
  devServer: {
    static: "./demo",
  },
  entry: {
    index: "./demo/demo.js",
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(png|jpe?g)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.demo.js",
    path: path.resolve(__dirname, "demo"),
  },
};
