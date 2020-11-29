const withCSS = require('@zeit/next-css');
const compose = require('next-compose');

module.exports = compose([
  [withCSS],
  {
    webpack(config) {
      config.module.rules.push({
        test: /\.(glb|gltf)$/,
        use: {
          loader: 'file-loader'
        }
      });
      return config;
    }
  }
]);
