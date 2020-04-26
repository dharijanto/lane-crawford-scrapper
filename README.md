# Lane Crawford Scrapper

-Lane Crawford is luxury retailers based in Hongkong, focusing on Asia.
 They focus mainly on luxury fashion items.
-This repository contains several scripts that I used for scrapping Lane Crawford's
 product catalog to download the product images.
 
 # 0-scrap-category-list.ts
 
 This scraps the list of categories inside from Lane Crawford landing page.
 The motivation behind scrapping them is to create a list of URLs for the
 different category pages. When run, this generates categories.json
 
 # 1-scrap-image-list.ts
 
 This takes categories.json from previous script, then capture all of the
 product images inside of each of categories. The script works by following
 through the 'next' button on the pagination section until it's exhausted.
 This generates images.json that contains the URL of each of the product pictures.
 
 
 # 2-download-images.ts
 
 This takes images.json from previous script, and download the images in parallel
 using 5 workers.

 
