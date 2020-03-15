import * as https from 'https'
import * as os from 'os'
import * as process from 'process'

import * as fs from 'fs'

import * as cheerio from 'cheerio'
import * as rs from 'readline-sync'

import lib from './library'

const BASE_URL = 'https://www.lanecrawford.com/'

function parseCategories (htmlData, results) {
  // On LC's home page (www.lanecrawford.com)
  // Categories are under hrefs that look like: '/category/catd000053/women/shoes/boots/'
  // More generally, we can generalize it with the following regex
  const re = /\/category\/[a-zA-Z0-9]+\/([a-z]+)\/([a-z]+)\/([a-z]+)+/
  let startIndex = 0
  let currentMatch
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
      results[currentMatch[0]] = { sex, category, subcategory }
    }
  } while (currentMatch !== null)
  return results
}

const file = process.argv[2] || './categories.json'
lib.readJSON(file).then(json => {
  return json
}).catch(err => {
  // Make sure the path is writable, as we don't wanna go all the way to fetch
  // the URL and parse if it turns out the output file is unwritable
  return lib.saveJSON({}, file).catch(err => {
    console.error('Failed to create file ' + file + ': ' + err.message)
    process.exit(1)
  }).then(() => {
    return {}
  })
}).then(loadedResults => {
  lib.getWebSource(BASE_URL).then(htmlData => {
    const results = parseCategories(htmlData, loadedResults)
    console.dir({ length: Object.keys(results).length })
    lib.saveJSON(results, file).then(() => {
      console.log('Output file saved as ' + file)
    }).catch(err => {
      console.error('Failed to save file: ' + err.message)
    })
  })
})
