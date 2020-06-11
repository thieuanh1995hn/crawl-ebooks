const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs');
var promiseRetry = require('promise-retry');
const Fs = require('fs')
const Path = require('path')
const Axios = require('axios');
(async () => {
    for (let i = 1; i < 327; i++) {
        let all_ebooks = []
        try {
            console.log("===================================================", i)
            const url = `https://api.epub.vn/api/books?p=${i}`
            const response = await promiseRetry((retry, number) => {
                return Axios({
                    url,
                    method: 'GET',
                    headers: { "api-access-token": "epubvn-react-app-123456" },
                    timeout: 8000
                }).catch(retry)
            }, { retries: 30 })
            let datas = response.data.data
            datas = datas.map(data => {
                return {
                    id: data._id,
                    name: data.name,
                    normalized_name: data.normalized_name,
                    slug: data.slug,
                    author: data.author,
                    normalized_author: data.normalized_author,
                    image: data.cover
                }
            })
            console.log(datas)
            all_ebooks = [...datas]
        } catch (e) {
            console.log(e)
            fs.appendFileSync("./error.json", JSON.stringify({ link: `https://www.epub.vn/categories?page=${i}`, error: e.message }) + ',')
        }
        fs.writeFileSync("./links_epub.json", JSON.stringify(all_ebooks));
    }

})();