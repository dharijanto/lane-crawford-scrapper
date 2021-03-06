import * as http from 'http'
import * as https from 'https'
import * as fs from 'fs'

import * as Promise from 'bluebird'

class Library {
  static getWebSource (url: String): Promise<string> {
    let getter = null
    if (url.startsWith('http://')) {
      getter = http.get
    } else if (url.startsWith('https://')) {
      getter = https.get
    } else {
      return Promise.reject(new Error('URL needs to start with either http or https'))
    }
  
    return new Promise((resolve, reject) => {
      getter(url, res => {
        if (res.statusCode !== 200) {
          reject(new Error('Failed to connect to the URL provided'))
        } else {
          let data = ''
          res.on('data', (chunk) => {
            res.setEncoding('utf8');
            data += chunk
          })
          res.on('end', () => {
            resolve(data)
          });
          res.on('error', (err) => {
            reject(err)
          })
        }
      })
    })
  }

  static readJSON (loadPath) {
    return new Promise((resolve, reject) => {
      fs.readFile(loadPath, 'utf8', function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(data))
        }
      })
    })
  }

  static readOrCreateJSON (loadPath, defaultContent) {
    return this.readJSON(loadPath).catch(err => {
      return this.saveJSON (defaultContent, loadPath)
    })
  }

  static saveJSON (data, savePath) {
    return new Promise((resolve, reject) => {
      fs.writeFile(savePath, JSON.stringify(data), 'utf8', function (err) {
        if (err) {
            reject(err)
        } else {
          resolve()
        }
      });
    })
  }

  static downloadToFile (url, filePath) {
    let getter = null
    if (url.startsWith('http://')) {
      getter = http.get
    } else if (url.startsWith('https://')) {
      getter = https.get
    } else {
      return Promise.reject(new Error('URL needs to start with either http or https'))
    }

    const file = fs.createWriteStream(filePath)
    return new Promise((resolve, reject) => {
      getter(url, function(res) {
        if (res.statusCode !== 200) {
          resolve('Unexpected server response')
        } else {
          res.pipe(file)
          res.on('end', () => {
            resolve()
          })
          res.on('error', (err) => {
            fs.unlinkSync(filePath)
            reject('Failed to download: ' + err.message)
          })
        }
      })
    })
  }
}

export default Library
