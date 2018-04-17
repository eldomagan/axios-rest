const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const configs = require('./config')

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

build(Object.keys(configs).map(key => configs[key]))

function build (builds) {
  let built = 0

  const total = builds.length

  const next = () => {
    buildEntry(builds[built]).then(() => {
      built++

      if (built < total) {
        next()
      }
    }).catch(logError)
  }

  next()
}

function buildEntry ({ input, output }) {
  return rollup.rollup(input)
    .then(bundle => bundle.generate(output))
    .then(({ code }) => {
      return write(output.file, code)
    })
}

function write (dest, code) {
  return new Promise((resolve, reject) => {
    function report (extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.writeFile(dest, code, err => {
      if (err) {
        return reject(err)
      }

      report()
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
