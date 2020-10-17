const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const webpackMd5Hash = require("webpack-md5-hash");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  debug: true,
  devtool: "inline-source-map",
  noInfo: false,
  entry: {
    main: path.resolve(__dirname, "src/index"),
    vendor: path.resolve(__dirname, "src/vendor"),
  },
  target: "web",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    filename: "[name].[contenthash].js",
  },
  devServer: {
    // Can be omitted unless you are using 'docker'
    // host: "",
    // This is where webpack-dev-server serves your bundle
    // which is created in memory.
    // To use the in-memory bundle,
    // your <script> 'src' should point to the bundle
    // prefixed with the 'publicPath', e.g.:
    //   <script src='http://localhost:9001/assets/bundle.js'>
    //   </script>
    // The local filesystem directory where static html files
    // should be placed.
    // Put your main static html page containing the <script> tag
    // here to enjoy 'live-reloading'
    // E.g., if 'contentBase' is '../views', you can
    // put 'index.html' in '../views/main/index.html', and
    // it will be available at the url:
    //   https://localhost:9001/main/index.html
    contentBase: path.resolve(__dirname, "src"),
    // 'Live-reloading' happens when you make changes to code
    // dependency pointed to by 'entry' parameter explained earlier.
    // To make live-reloading happen even when changes are made
    // to the static html pages in 'contentBase', add
    // 'watchContentBase'
    watchContentBase: true,
    compress: true,
    port: 3001,
  },
  plugins: [
    new ExtractTextPlugin("[name].[contenthash].css"),
    new webpackMd5Hash(),
    // Create HTML file that includes reference to bundled JS.
    new HtmlWebpackPlugin({
      template: "src/index.html",
      inject: true,
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
    }),
  ],
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loaders: ["babel"] },
      {
        test: /\.css$/,
        // use: [
        //   {
        //     // This loader resolves url() and @imports inside CSS
        //     loader: "css-loader",
        //   },
        //   {
        //     // Then we apply postCSS fixes like autoprefixer and minifying
        //     loader: "postcss-loader",
        //   },
        //   {
        //     // First we transform SASS to standard CSS
        //     loader: "sass-loader",
        //     options: {
        //       implementation: require("sass"),
        //     },
        //   },
        // ],
        loader: ExtractTextPlugin.extract("css?sourceMap"),
        // loaders: ["style", "css"],
      },
      {
        // Now we apply rule for images
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            // Using file-loader for these files
            loader: "file-loader",

            // In options we can set different things like format
            // and directory to save
            options: {
              outputPath: "images",
            },
          },
        ],
      },
    ],
  },
};
