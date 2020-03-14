import * as https from 'https'
import lib from './library'

const BASE_URL = 'https://www.lanecrawford.com/'

lib.getWebSource(BASE_URL).then(source => {
  console.log(source)
})