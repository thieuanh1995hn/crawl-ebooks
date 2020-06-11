const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs');
var promiseRetry = require('promise-retry');
const Fs = require('fs')
const Path = require('path')
const Axios = require('axios');
(async () => {
    for (let i = 1; i < 216; i++) {
        console.log("===================================================", i)
        const url = `https://sachvui.com/the-loai/tat-ca.html/${i}`

        // const path = Path.resolve(__dirname, 'test.pdf')
        // const writer = Fs.createWriteStream(path)
        const response = await promiseRetry((retry, number) => {
            return Axios({
                url,
                timeout: 10000

            }).catch(retry)
        }, { retries: 30 })

        // console.log(response.data)
        let $ = cheerio.load(response.data)
        let ebookDivs = $('.col-xs-6.col-md-3.col-sm-3.ebook').toArray()
        console.log(ebookDivs.length)
        for (let div of ebookDivs) {
            let name = $(div).find('.tieude').text().trim()
            let link = $(div).find('.thumbnail').prop('href')
            console.log(name, link)
            fs.appendFileSync("./links.json", JSON.stringify({ name, link }) + ',');
        }
    }

})();