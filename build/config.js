const path = require('path')
const babel = require('rollup-plugin-babel')
const eslint = require('rollup-plugin-eslint')
const uglify = require('rollup-plugin-uglify')
// const alias = require('rollup-plugin-alias')
const commonjs = require('rollup-plugin-commonjs')
// const replace = require('rollup-plugin-replace')
const nodeResolve = require('rollup-plugin-node-resolve')
// const flow = require('rollup-plugin-flow-no-whitespace')
const progress = require('rollup-plugin-progress')
const version = process.env.VERSION || require('../package.json').version

const banner =
  '/*!\n' +
  ' * netopo.js v' + version + '\n' +
  ' * (c) 2017-' + new Date().getFullYear() + ' bi wenqing\n' +
  ' * Released under the MIT License.\n' +
  ' */'

const resolve = p => path.resolve(__dirname, '../', p)

const builds = {
  // (CommonJS). Used by bundlers e.g. Webpack & Browserify
  'prod-cjs': {
    entry: resolve('src/index.js'),
    dest: resolve('dist/netopo.common.min.js'),
    format: 'cjs',
    env: 'production',
    plugins: [uglify()],
    banner
  },
  // (ES Modules). Used by bundlers that support ES Modules,
  // e.g. Rollup & Webpack 2
  'prod-esm': {
    entry: resolve('src/index.js'),
    dest: resolve('dist/netopo.esm.min.js'),
    format: 'es',
    env: 'production',
    plugins: [uglify()],
    banner
  },
  // production build
  'prod-umd': {
    entry: resolve('src/index.js'),
    dest: resolve('dist/netopo.min.js'),
    format: 'umd',
    env: 'production',
    plugins: [uglify()],
    banner
  },
  // development build (CommonJS)
  'full-cjs': {
    entry: resolve('src/index.js'),
    dest: resolve('dist/netopo.common.js'),
    format: 'cjs',
    env: 'development',
    banner
  },
  // development build  (ES Modules)
  'full-esm': {
    entry: resolve('src/index.js'),
    dest: resolve('dist/netopo.esm.js'),
    format: 'es',
    env: 'development',
    banner
  },
  // development build.
  'full-umd': {
    entry: resolve('src/index.js'),
    dest: resolve('dist/netopo.js'),
    format: 'umd',
    env: 'development',
    banner
  },
}

function genConfig (name) {
  const opts = builds[name]
  const config = {
    input: opts.entry,
    plugins: [
      progress(),
      eslint(),
      nodeResolve(),
      babel({
        exclude: 'node_modules/**',
        runtimeHelpers: true,
      }),
      commonjs(),
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'Netopo'
    }
  }

  Object.defineProperty(config, '_name', {
    enumerable: false,
    value: name
  })

  return config
}

if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET)
} else {
  exports.getBuild = genConfig
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig)
}
