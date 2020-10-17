import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import webpack from "webpack";
import webpackMd5Hash from "webpack-md5-hash";
import ExtractTextPlugin from "extract-text-webpack-plugin";

export default {
  debug: true,
  devtool: "source-map",
  noInfo: false,
  entry: {
    main: path.resolve(__dirname, "src/index"),
    vendor: path.resolve(__dirname, "src/vendor"),
  },
  target: "web",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    filename: "[name].[chunkhash].js",
  },
  devServer: {
    contentBase: "./dist",
    hot: true,
  },
  plugins: [
    new ExtractTextPlugin("[name].[contenthash].css"),
    new webpackMd5Hash(),
    // Create HTML file that includes reference to bundled JS.
    new HtmlWebpackPlugin({
      template: "src/index.html",
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
      },
      trackJSToken: "00a2f8ab85bc40aabe430a3498347ddd",
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
      },
    ],
  },
};
