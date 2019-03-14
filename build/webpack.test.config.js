const path = require("path");

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  devtool: "eval-source-map",
  module : {
    rules: [
      {
        test   : /\.vue$/,
        loader : 'vue-loader',
        options: {
          less: 'vue-style-loader!css-loader!less-loader',
        }
      },
      {
        test   : /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use    : {
          loader : "babel-loader",
          options: {
            presets: [ "@babel/preset-env" ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [ '.js', '.vue' ],
    alias     : {
      'vue$': 'vue/dist/vue.esm.js',
      '@'   : resolve('../src'),
    }
  }
};
