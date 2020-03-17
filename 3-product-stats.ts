

import lib from './library'

const imageListFile = process.argv[2] || './images.json'
const categoryListFile = process.argv[2] || './categories.json'

const counter = {}
lib.readJSON(categoryListFile).then(categoryMappingObj => {
  return lib.readJSON(imageListFile).then((imageMapping: any) => {
    // /category/Backpacks/women/bags/backpacks
    Object.keys(imageMapping).forEach(urlPath => {
      const imageObj = imageMapping[urlPath]
      const len = Object.keys(imageObj).length
      // console.log(`${urlPath}: ${len}`)
      const { sex, category, subcategory } = categoryMappingObj[urlPath]
      if (!(sex in counter)) {
        counter[sex] = {}
      }
      if (!(category in counter[sex])) {
        counter[sex][category] = {}
      }
      if (!(subcategory in counter[sex][category])) {
        counter[sex][category][subcategory] = len
      } else {
        counter[sex][category][subcategory] += len
      }

      return
    })
  })
}).then(() => {
  //console.dir({counter: JSON.stringify(counter, null, 2)})
  console.dir({counter: JSON.stringify(counter)})
})