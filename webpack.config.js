const path = require('path');
module.exports = {
    target: 'node',
    entry: './src/tracker/main.js',
    mode: "production",
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
