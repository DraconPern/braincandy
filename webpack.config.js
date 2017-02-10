var path = require('path');

var config = {
  context: path.join(__dirname, 'src'),
  entry: [
    './client.js',
  ],
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
     }
    ]
  },
  resolve: {
    modules: [
     path.join(__dirname, "node_modules"),

    ]
  },
};

module.exports = config;
