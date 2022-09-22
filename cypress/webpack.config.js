module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: [/node_modules/],
        use: [{
          loader: 'babel-loader',
        }],
      },
      {
        test: /\.wasm$/,
        type: 'javascript/auto',
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.ts', '.tsx', '.json', 'fs'],
  },
  node: {
    fs: 'empty',
  },
};
