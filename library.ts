import * as http from 'http'
import * as https from 'https'

import * as Promise from 'bluebird'

class Library {
  static getWebSource (url: String): Promise<string> {
    let getter = null
    if (url.startsWith('http://')) {
      getter = http.get
    } else if (url.startsWith('https://')) {
      getter = https.get
    } else {
      return Promise.reject('URL needs to start with either http or https!')
    }
  
    return new Promise((resolve, reject) => {
      getter(url, res => {
        if (res.statusCode !== 200) {
          reject('Failed to connect to the URL provided!')
        } else {
          let data = ''
          res.once('data', (chunk) => {
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
}

export default Library
