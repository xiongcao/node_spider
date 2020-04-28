const fs = require('fs')

// 读取目录
function readDir(path, options = {
  encoding: 'utf8',
  withFileTypes: false
}) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, options, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(files)
      }
    })
  })
}

// 读取文件
function readFile(path, options = {
  encoding: 'utf8',
  flag: 'r'
}) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, options, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

// 写入文件
function writeFile(path, data, options = {
  encoding: 'utf8',
  mode: '0666',
  flag: 'w'
}) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, options, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

module.exports = {
  readDir,
  readFile,
  writeFile
}