import * as Promise from 'bluebird'
import * as cheerio from 'cheerio'
import * as _ from 'lodash'

import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as process from 'process'

// const $ = cheerio.load(htmlData)

const START_PAGE = 1
const END_PAGE = 111
const BASE_URL = 'https://www.lanecrawford.com/category/catd000129/women/clothing/page/'
const SAVE_PATH = `${__dirname}\\lane-crawford-images.json`
let imageUrls = require(SAVE_PATH)
Promise.each(_.range(START_PAGE, END_PAGE + 1), i => {
  console.log('Processing page ' + i)
  const url = BASE_URL + i
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) {
        reject('Failed to load page ' + i)
      }

      res.once('data', (chunk) => {
        let data = ''
        res.setEncoding('utf8');
        res.on('data', (rcvd) => {
          data += rcvd
        })
        res.on('end', () => {
          // resolve(data)
          const urls = retrieveImages(data)
          urls.forEach(url => {
            imageUrls[url] = ''
          })
          saveJSON(imageUrls)
          // console.dir(urls)
          resolve()
        });
        res.on('error', (err) => {
          reject(err)
        })
      })
    })
  })
}).then((index, urls) => {
  saveJSON(imageUrls)
  console.log('length=' + Object.keys(imageUrls).length)
})

function retrieveImages (htmlData) {
  const $ = cheerio.load(htmlData)
  const classes = 'plp-index scale loadingRotater'
  const imageElements = $('img.plp-index.scale.loadingRotater')
  const urls = []
  // console.log(imageElements.length)
  imageElements.each((index, element) => {
    urls.push($(element).attr('data-img'))
  })
  
  return urls
}

function findText ($: CheerioStatic, cheerio, e: CheerioElement, findClause): string {
  return $(e).find(findClause).text().trim()
}

function findAttr ($: CheerioStatic, e: CheerioElement, findClause, attrName): string {
  return $(e).find(findClause).attr(attrName)
}

function saveJSON (data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(SAVE_PATH, JSON.stringify(data), 'utf8', function (err) {
      if (err) {
          console.log("An error occured while writing JSON Object to File.");
          reject(err)
      } else {
        console.log("JSON file has been saved.");
        resolve()
      }
    });
  })
}