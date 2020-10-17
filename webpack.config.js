const fs = require('fs');
const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const normalizeText = (text) => {
  const firstChar = text.charAt(0);
  const remainingChars = text.substr(1);

  return firstChar.toUpperCase() + remainingChars.toLowerCase();
};

const isProduction = process.env.NODE_ENV === 'production';

const webpackConfig = {
  context: path.resolve(__dirname),
  entry: {
    main: './src/js/global.js',
    home: './src/views/templates/home/home.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      jquery: path.join(__dirname, 'node_modules/jquery/src/jquery'),
      '@': path.resolve(__dirname, 'dist'),
    },
    extensions: ['.js', '.scss'],
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {},
          },
        ],
      },
      {
        test: /\.(handlebars|hbs)$/,
        loader: 'handlebars-loader',
        query: {
          partialDirs: [
            path.join(__dirname, 'src'),
            path.join(__dirname, 'src', 'views'),
            path.join(__dirname, 'src', 'views', 'layouts'),
            path.join(__dirname, 'src', 'views', 'templates'),
            path.join(__dirname, 'src', 'views', 'partials'),
          ].concat(
            glob.sync('**/', {
              cwd: path.resolve(__dirname, 'src', 'views', 'partials'),
              realpath: true,
            })
          ),
        },
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        use: {
          loader: 'file-loader',
          options: {
            context: './media',
            name: '[path][name].[ext]',
          },
        },
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: path.resolve(__dirname, '../src/scss'),
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          {
            loader: 'css-loader',
            options: { sourceMap: !isProduction },
          },
          {
            loader: 'postcss-loader',
            options: { sourceMap: !isProduction },
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: !isProduction },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: !isProduction ? 'css/[name].css' : 'css/[name].[hash:8].css',
      chunkFilename: !isProduction ? '[id].css' : '[id].[hash:8].css',
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new CopyPlugin({ patterns: [{ from: './src/media', to: 'media' }] }),
  ],
};

fs.readdirSync(path.join(__dirname, 'src', 'views', 'templates')).forEach(
  (page) => {
    const htmlPageInit = new HtmlWebPackPlugin({
      title: `${normalizeText(page)} | Frontend Boilerplate`,
      template: `./src/views/templates/${page}/${page}.hbs`,
      filename: `./${page === 'home' ? 'index' : `${page}`}.html`,
      chunks: ['main', page],
      minify: {
        collapseWhitespace: false,
        collapseInlineTagWhitespace: false,
        conservativeCollapse: false,
        preserveLineBreaks: false,
        removeAttributeQuotes: false,
        removeComments: false,
        useShortDoctype: false,
        html5: true,
      },
    });

    webpackConfig.entry[page] = `./src/views/templates/${page}/${page}.js`;
    webpackConfig.plugins.push(htmlPageInit);
  }
);

module.exports = webpackConfig;
