import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as process from 'process'

import * as Promise from 'bluebird'
import * as cheerio from 'cheerio'
import * as _ from 'lodash'

import lib from './library'

const imageListFile = process.argv[2] || './images.json'
const outputDirectory = process.argv[3] || './images'

try {
  const stat = fs.statSync(outputDirectory)
  if (stat.isDirectory()) {
    lib.readOrCreateJSON(imageListFile, {}).then((imageList: any) => {
      const mountPaths = Object.keys(imageList)
      const numOfImages = mountPaths.reduce((count, path) => {
        return count + Object.keys(imageList[path]).length
      }, 0)
      console.log(`There are ${numOfImages} images`)
      return Promise.map(mountPaths, mountPath => {
        const imagesObj = imageList[mountPath]
        const imageURLs = Object.keys(imagesObj)
        return Promise.each(imageURLs, url => {
          const filename = _.last(url.split('/'))
          const filepath = path.join(outputDirectory, filename)
          try {
            const stat = fs.statSync(filepath)
            console.log(`Skipping ${filename} because it already exists!`)
            return
          } catch (err) {
            console.log(`Downloading ${filename}...`)
            return lib.downloadToFile(url, filepath)
          }
        })
      }, { concurrency: 5 })
    }).catch(err => {
      console.error('Failed: ' + err.message)
    })
  } else {
    throw new Error('Output directory is not valid!')
  }
} catch (err) {
  console.error('Failed: ' + err.message)
}

