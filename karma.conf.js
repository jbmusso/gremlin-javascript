module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    frameworks: ['mocha'],

    files: [
      'test/**/*.js'
    ],
    exclude: [
      'test/_bootstrap.js'
    ],

    preprocessors: {
      'src/**/*.js': ['webpack'],
      'test/**/*.js': ['webpack']
    },

    babelPreprocessor: {
      options: {
        presets: ['es2015', 'stage-2'],
        sourceMap: 'inline'
      },
      filename: (file) => {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: (file) => {
        return file.originalPath;
      }
    },

    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  })
}
