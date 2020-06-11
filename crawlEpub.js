const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs');
var promiseRetry = require('promise-retry');
const Fs = require('fs')
const Path = require('path');
const Axios = require('axios');
const puppeteer = require('puppeteer');
const cookie = [
    {
        "domain": ".epub.vn",
        "expirationDate": 1594267886.087487,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__cfduid",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "dbe4772c17e76cae951ba44da86cdaf671591675885",
        "id": 1
    },
    {
        "domain": ".epub.vn",
        "expirationDate": 1654931985,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_ga",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "GA1.2.490359904.1591675890",
        "id": 2
    },
    {
        "domain": ".epub.vn",
        "expirationDate": 1591860045,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_gat_gtag_UA_38247723_5",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "1",
        "id": 3
    },
    {
        "domain": ".epub.vn",
        "expirationDate": 1591946385,
        "hostOnly": false,
        "httpOnly": false,
        "name": "_gid",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "GA1.2.663891553.1591675890",
        "id": 4
    },
    {
        "domain": ".epub.vn",
        "expirationDate": 1623386145,
        "hostOnly": false,
        "httpOnly": false,
        "name": "fbm_702372660130091",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "base_domain=.epub.vn",
        "id": 5
    },
    {
        "domain": ".epub.vn",
        "expirationDate": 1593069585.894367,
        "hostOnly": false,
        "httpOnly": true,
        "name": "user-auth-token",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "s%3AeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlzaGliYXNoaWd1aXRhcjAxQGdtYWlsLmNvbSIsImlhdCI6MTU5MTg1OTk4NCwiZXhwIjoxNTkyNDY0Nzg0fQ.PAVji2LGnDrWCIUkFHHaPuX0iSrl0-hGGr4ohGtqe1g.ir7A4TUHG3KWykIIO%2FQXqw8S0vabdWwJj0r850gOzIw",
        "id": 6
    },
    {
        "domain": ".epub.vn",
        "expirationDate": 1593069585,
        "hostOnly": false,
        "httpOnly": false,
        "name": "user-email",
        "path": "/",
        "sameSite": "lax",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "ishibashiguitar01@gmail.com",
        "id": 7
    },
    {
        "domain": "www.epub.vn",
        "expirationDate": 1623320451,
        "hostOnly": true,
        "httpOnly": false,
        "name": "dark-mode",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "false",
        "id": 8
    },
    {
        "domain": "www.epub.vn",
        "hostOnly": true,
        "httpOnly": false,
        "name": "next-i18next",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": true,
        "storeId": "0",
        "value": "en",
        "id": 9
    }
];
(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 10
    });
    const page = await browser.newPage();
    await page.setCookie(...cookie)

    await page.goto('https://www.epub.vn/books/the-subtle-art-of-not-giving-a-fck-1544368919');

    await sleep(randomMs())
    await page.screenshot({ path: 'example.png' });
    await page.waitForXPath("//button[contains(@class, 'btn-download')]")
    await sleep(randomMs())
    await page.click(".btn.btn-download.btn-sm:nth-child(4)");
    await sleep(randomMs())
    const finalResponse = await page.waitForResponse(response => response.url() === 'https://api.epub.vn/api/downloadebook/the-subtle-art-of-not-giving-a-fck-1544368919/pdf' && response.status() === 200);
    let responseJson = await finalResponse.json();
    let pdf_url = responseJson.data
    if (pdf_url) {
        const path = Path.resolve(__dirname, `test.pdf`)
        const writer = Fs.createWriteStream(path)
        const response = await promiseRetry((retry, number) => {
            return Axios({
                url: pdf_url,
                method: 'GET',
                responseType: 'stream',
                timeout: 10000
            }).catch(() => { console.log("retry href: " + href); return retry })
        }, { retries: 30 })
        response.data.pipe(writer)
    }

    // await browser.close();
})();

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function randomMs(min = 200, max = 1000) {
    min = Math.ceil(min);
    max = Math.floor(max);
    const ms = Math.floor(Math.random() * (max - min)) + min;
    console.log(ms)
    return ms
}