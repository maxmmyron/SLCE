const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        index: './src/core/Engine.js'
    },
    devServer: {
        "static": "./demo",
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build'),
    }
}