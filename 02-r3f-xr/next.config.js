const withCSS = require('@zeit/next-css')
const compose = require('next-compose')
cssConfig = {}
module.exports = compose([
  [withCSS, cssConfig],
  {
    webpack(config, options) {
      config.module.rules.push({
        test: /\.(mp3)$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/sounds/',
            outputPath: 'static/sounds/',
            name: '[name].[ext]',
            esModule: false,
          },
        },
      })
      config.module.rules.push({
        test: /\.jpg$/,
        use: {
          loader: 'url-loader',
        },
      })

      config.module.rules.push({
        test: /\.(glb|gltf)$/,
        use: {
          loader: 'file-loader',
        },
      })

      return config
    },
  },
])
