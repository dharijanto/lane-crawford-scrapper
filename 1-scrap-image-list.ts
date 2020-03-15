import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as process from 'process'

import * as Promise from 'bluebird'
import * as cheerio from 'cheerio'
import * as _ from 'lodash'

import lib from './library'
import { parse } from 'querystring'

const BASE_URL = 'https://www.lanecrawford.com'

const categoryListFile = process.argv[2] || './categories.json'
const outputFile = process.argv[3] || './images.json'

// Ensure output file is accessible
lib.readOrCreateJSON(outputFile, {}).then((imageList: any) => {
  // Read categories
  lib.readJSON(categoryListFile).then(json => {
    const paths = Object.keys(json).sort()
    return Promise.each(paths, path => {
      console.dir({path})
      // TODO: Add parameter so we're not skipping keys that already existed (i.e. for updating database)
      if (path in imageList) {
        console.log(`Skipping ${path} as it's already existed`)
        return Promise.resolve()
      } else {
        return retrieveImages(path).then(images => {
          imageList[path] = Object.assign(imageList[path] || {}, images)
          // TODO: For efficiency sake, saving should be done on finally
          return lib.saveJSON(imageList, outputFile)
        })
      }
      // const nextPages = getPages
    })
  }).catch(err => {
    console.error('Failed to read category-list file: ' + err.message)
  })
})


function retrieveImages (path): Promise<any> {
  const images = {}
  function getImagesOnURL (path) {
    const url = new URL(path, BASE_URL).href
    console.log(`getImagesOnURL(${url})`)
    return lib.getWebSource(url).then(htmlData => {
      const $ = cheerio.load(htmlData)
      const imageElements = $('img.plp-index.scale.loadingRotater')
      imageElements.each((index, element) => {
        images[$(element).attr('data-img')] = ''
      })

      const next = $('link[id="next"]')
      if (next.attr('href')) {
        const nextURL = next.attr('href')
        console.dir({nextURL})
        return getImagesOnURL(nextURL)
      } else {
        return images
      }
    })
  }
  return getImagesOnURL(path)
}

//const results = parsePages('https://www.lanecrawford.com/category/catd000128/women/clothing/dresses/', 'https://www.lanecrawford.com/category/catd000128/women/clothing/dresses/page/2')
//console.dir(results)

function parsePages (currentURL, htmlData) {
  // On LC's home page (www.lanecrawford.com)
  // Categories are under hrefs that look like: '/category/catd000053/women/shoes/boots/'
  // More generally, we can generalize it with the following regex
  const re = new RegExp(`${currentURL}/page/[0-9]+`) // /\/category\/[a-zA-Z0-9]+\/([a-z]+)\/([a-z]+)\/([a-z]+)+/
  let startIndex = 0
  let currentMatch
  const results = []
  // let results = [] as any
  do {
    // console.dir({ start: startIndex })
    currentMatch = htmlData.substring(startIndex).match(re)
    if (currentMatch !== null) {
      const len = currentMatch[0].length
      startIndex = startIndex + len + currentMatch.index
      const [ sex, category, subcategory ] = [currentMatch[1], currentMatch[2], currentMatch[3]]
      // console.dir(cur)
      // console.dir({len, start: startIndex, sex, category, subcategory})
      results.push(currentMatch[0])
    }
  } while (currentMatch !== null)
  return results
}


// const $ = cheerio.load(htmlData)
/*
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
} */