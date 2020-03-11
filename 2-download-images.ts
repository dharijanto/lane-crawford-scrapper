import * as https from 'https'
import * as fs from 'fs'

import * as Promise from 'bluebird'
import * as _ from 'lodash'

const SAVE_PATH = `${__dirname}\\lane-crawford-images.json`
const IMAGE_URLS = require(SAVE_PATH)

const urls = Object.keys(IMAGE_URLS)

Promise.map(urls, url => {
  const fileName = _.last(url.split('\/'))
  const file = fs.createWriteStream(`${__dirname}/images/${fileName}`)

  return new Promise((resolve, reject) => {
    https.get(url, function(res) {
      if (res.statusCode !== 200) {
        resolve('Error downloading file=' + fileName)
      } else {
        res.pipe(file);
        res.on('end', () => {
          console.log('Downloaded file=' + )
          resolve()
        })
      }
    });
  })
}, { concurrency: 5 })
