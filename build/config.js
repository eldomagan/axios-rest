const path = require('path')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')

const resolve = _path => path.resolve(__dirname, '../', _path)

const configs = {
  umdDev: {
    input: resolve('src/index.js'),
    file: resolve('dist/axios-rest-client.js'),
    format: 'umd',
    env: 'development'
  },
  umdProd: {
    input: resolve('src/index.js'),
    file: resolve('dist/axios-rest-client.min.js'),
    format: 'umd',
    env: 'production'
  },
  commonjs: {
    input: resolve('src/index.js'),
    file: resolve('dist/axios-rest-client.common.js'),
    format: 'cjs'
  },
  esm: {
    input: resolve('src/index.js'),
    file: resolve('dist/axios-rest-client.esm.js'),
    format: 'es'
  }
}

function genConfig (opts) {
  const plugins = [
    nodeResolve(),
    commonjs(),
    babel({
      exclude: ['node_modules/**']
    })
  ]

  if (opts.env === 'production') {
    plugins.push(uglify())
  }

  return {
    input: {
      input: opts.input,
      external: ['axios'],
      plugins: plugins,

      onwarn (warning) {
        if (warning.code === 'THIS_IS_UNDEFINED') {
          return
        }

        if (warning.code === 'CIRCULAR_DEPENDENCY') {
          return
        }

        console.error(warning.message)
      }
    },

    output: {
      name: 'axiosRestClient',
      file: opts.file,
      format: opts.format
    }
  }
}

function mapValues (obj, fn) {
  const res = {}

  Object.keys(obj).forEach(key => {
    res[key] = fn(obj[key], key)
  })

  return res
}

module.exports = mapValues(configs, genConfig)
