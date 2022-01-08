const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ESLintPlugin = require('eslint-webpack-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const PATHS = {
  src: path.join(__dirname, 'src/templates/views'),
};
const PAGES_DIR = PATHS.src;
const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'));
let mode = 'development';

if (process.env.NODE_ENV == 'production') {
  mode = 'production';
}

console.log(mode,'from webpack.config');

module.exports = {
  mode: mode,
  entry: {
    index: {
      import: './src/js/index.js',
    },
  },
  devtool: mode === 'development' ? 'inline-source-map' : false,
  devServer: {
    static: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'dist')],
    compress: true,
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          mode === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  autoprefixer(),
                  cssnano()
                ],
              },
            }
          },
          "sass-loader",
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext]'
        }
      },
      {
        test: /\.pug/,
        use: [
          {
            loader: 'html-loader',
          },
          {
            loader: 'pug-html-loader',
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name][contenthash].css'
    }),
    ...PAGES.map(page => new HtmlWebpackPlugin ({
      template: `${PAGES_DIR}/${page}`,
      filename: `./${page.replace(/\.pug/,'.html')}`,
      inject: 'body',
    })),
    new HtmlWebpackPugPlugin(),
    new ESLintPlugin()
  ],
  output: {
    filename: 'js/[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
};