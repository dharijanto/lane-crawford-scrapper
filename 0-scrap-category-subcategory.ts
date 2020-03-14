import * as https from 'https'
import * as os from 'os'

import * as cheerio from 'cheerio'
import * as rs from 'readline-sync'

import lib from './library'

const BASE_URL = 'https://www.lanecrawford.com/'


function parseCategories (htmlData) {
  // On LC's home page (www.lanecrawford.com)
  // Categories are under hrefs that look like: '/category/catd000053/women/shoes/boots/'
  // More generally, we can generalize it with the following regex
  const re = /\/category\/[a-zA-Z0-9]+\/([a-z]+)\/([a-z]+)\/([a-z]+)+/
  let startIndex = 0
  let currentMatch
  let results = [] as any
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


lib.getWebSource(BASE_URL).then(htmlData => {
  const $ = cheerio.load(htmlData)
  // URL for each of the category looks like this
  // /category/catd000053/women/shoes/boots/
  // Or generally speaking
  // /category/catd000053/:sex/:category/:subcategory/
  const results = parseCategories(htmlData)
  console.dir(results)
  console.dir({ length: Object.keys(results).length })
  // TODO: Save to JSON file
})