const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

var curUrl;
const scrapeWebsite = async (url,ignore=false) => {
    try {
        // Fetch the HTML from the URL
        const { data: html } = await axios.get(url);
        curUrl = new URL(url)
        // console.log(curUrl)
        // console.log(html);
        // Load it into cheerio
        const $ = cheerio.load(html);

        let body = $("html").find("tr")
        body.each((i, el) => {
            let test = $(el).find("a")
            let href = test.attr("href")
            let date = $(el).find("td.fb-d")
            if ((i < 3||ignore) && test.html()!=null && href != "..") {
                if(i==2 && (!ignore)){
                    scrapeWebsite(curUrl.origin + href,true)
                }
                if (!test) {
                    console.log("no at", i)
                }
                else {
                    console.log(i, test.html(),href,date.text())
                }
            }
            // fs.writeFile(`./test${i}.html`, $(el).html(),(error)=>{
            //     if(error){
            //         console.log(error)
            //     }else{
            //         console.log("done")
            //     }
            // })
        })
    } catch (error) {
        console.error('Error scraping:', error.message);
    }
};

scrapeWebsite('http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%99%A5%20%20A%20%20%E2%80%94%20%20L/');
