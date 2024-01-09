import path    from 'path'
import webpack from 'webpack'
import process from 'process'

const isProduction = (process.env.NODE_ENV === 'production')

let config = {
  mode: 'development',
  entry: ['./src/react/main.js'],
  output: {
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  },
  plugins: isProduction ? [ new webpack.optimize.UglifyJsPlugin() ] : []
}


function scripts() {

  return new Promise(resolve => webpack(config, (err, stats) => {

    if(err) console.log('Webpack', err)

    console.log(stats.toString({ /* stats options */ }))

    resolve()
  }))
}

module.exports = { config, scripts }
