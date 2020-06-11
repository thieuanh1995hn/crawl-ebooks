const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs');
var promiseRetry = require('promise-retry');
const Fs = require('fs')
const Path = require('path')
const Axios = require('axios');
(async () => {
    let data = JSON.parse(fs.readFileSync("./links.json"));
    data.map((elm, i) => { elm.key = i; return elm })
    console.log(data)
    data = data.filter(elm => [641, 853, 877, 897].includes(elm.key))
    while (data.length > 0) {
        let promises = data.splice(0, 10).map(async elm => {
            try {
                console.log("LINK PAGE: ", elm.link, ' ' + elm.key)
                const response = await promiseRetry((retry, number) => {
                    return Axios({
                        url: elm.link,
                        timeout: 10000
                    }).catch(() => { console.log("retry link: " + elm.link); return retry })
                }, { retries: 30 })
                let $ = cheerio.load(response.data)
                let href = $('.thong_tin_ebook .btn-danger').prop('href')
                console.log(href)
                if (href) {
                    const image = $('.thong_tin_ebook .cover img').prop('src')
                    const author = $('.thong_tin_ebook h5:contains(Tác giả)').text().split(":")[1].trim()
                    const category = $('.thong_tin_ebook h5:contains(Thể Loại) a').text().trim()
                    const path = Path.resolve(__dirname, 'sachvui_pdf', `${convertStringToCode(elm.name)}.pdf`)
                    const writer = Fs.createWriteStream(path)
                    const response = await promiseRetry((retry, number) => {
                        return Axios({
                            url: href,
                            method: 'GET',
                            responseType: 'stream',
                            timeout: 10000

                        }).catch(() => { console.log("retry href: " + href); return retry })
                    }, { retries: 30 })
                    response.data.pipe(writer)
                    fs.appendFileSync("./sachvui_pdf.json", JSON.stringify({ name: elm.name, link: elm.link, image, author, category, key: elm.key, pdf: `${convertStringToCode(elm.name)}.pdf` }) + ',');
                    return promiseTimeout(new Promise((resolve, reject) => {
                        writer.on('finish', resolve)
                        writer.on('error', () => {
                            fs.appendFileSync("./error.json", JSON.stringify({ name: elm.name, link: elm.link, key: elm.key, err: "Download too long" } + ','))
                            return resolve()
                        })
                    }).then(console.log("DONE ", `${convertStringToCode(elm.name)}.pdf`)), 90000).catch(e => fs.appendFileSync("./error.json", JSON.stringify({ name: elm.name, link: elm.link, key: elm.key, err: "Download too long" } + ','))
                    )
                }
                return
            } catch (e) {
                fs.appendFileSync("./error.json", JSON.stringify({ name: elm.name, link: elm.link, key: elm.key, err: e.message }))
                return
            }
        })
        await Promise.all(promises).catch(e => console.log(e)).then(r => console.log("Bulk Done"))
    }
    console.log("FINISH!!!!!")
})();

const convertStringToCode = (alias) => {
    var str = alias;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(
        /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
        "_"
    );
    str = str.replace(/ + /g, " ");
    str = str.replace(/ /g, "_");
    str = str.trim();
    return str;
};


const promiseTimeout = function (promise, ms) {

    // Create a promise that rejects in <ms> milliseconds
    let timeout = new Promise((resolve, reject) => {
        let id = setTimeout(() => {
            clearTimeout(id);
            reject('Timed out in ' + ms + 'ms.')
        }, ms)
    })

    // Returns a race between our timeout and the passed in promise
    return Promise.race([
        promise,
        timeout
    ])
}