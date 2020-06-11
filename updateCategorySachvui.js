const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs');
var promiseRetry = require('promise-retry');
const Fs = require('fs')
const Path = require('path')
const Axios = require('axios');
(async () => {
    let data = JSON.parse(fs.readFileSync("./sachvui_pdf.json"));

    while (data.length > 0) {
        let promises = data.splice(0, 10).map(async elm => {
            try {
                const response = await promiseRetry((retry, number) => {
                    return Axios({
                        url: elm.link,
                        method: 'GET',
                        timeout: 10000
                    }).catch(() => { console.log("retry href: " + elm.link); return retry })
                }, { retries: 30 })
                let $ = cheerio.load(response.data)
                const category = $('.thong_tin_ebook h5:contains(Thể Loại) a').text().trim()
                if (category) {
                    elm.category = category
                }
                fs.appendFileSync("./data_pdf.json", JSON.stringify(elm) + ',');
                return elm
            } catch (e) {
                fs.appendFileSync("./error.json", JSON.stringify({ name: elm.name, link: elm.link, key: elm.key, err: e.message }))
                return
            }
        })
        await Promise.all(promises)

    }
    console.log("FINISH!!!!!")


})();