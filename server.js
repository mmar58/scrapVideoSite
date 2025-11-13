const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
let port = 3081;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());


let scrapeParentLink = 'http://172.16.50.14';
const scrapeWebsite = async (url) => {
    try {
        // Fetch the HTML from the URL
        let currentUrl = ""+url;
        if(!currentUrl.includes("http")){
            if(currentUrl.startsWith("/")){
                currentUrl = scrapeParentLink + currentUrl;
            }else{
                currentUrl = scrapeParentLink + "/" + currentUrl;
            }
        }
        const { data: html } = await axios.get(currentUrl);
        io.emit("scrapeStarted", { message: "Scraping started" });
        const $ = cheerio.load(html);

        let body = $("html").find("tr")
        body.each((i, el) => {
            let test = $(el).find("a")
            let href = test.attr("href")
            let date = $(el).find("td.fb-d")
            if (test.html() != null && href != "..") {
                let scrappedRow = {
                    id:i,
                    title: test.html(),
                    link: href,
                    date: date.text()
                }
                // Send row data to all connected clients
                io.emit("scrapedRow", scrappedRow);
                // console.log(i,scrappedRow);
            }
        })
        io.emit("scrapeCompleted", { message: "Scraping completed" });
    } catch (error) {
        console.error('Error scraping:', error.message);
        io.emit("scrapeError", { message: "Error occurred during scraping" });
    }
};

// scrapeWebsite('http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%99%A5%20%20A%20%20%E2%80%94%20%20L/');
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('scrap', (url) => {
        console.log('scraping', url);
        scrapeWebsite(url);
    });
    socket.on('testData', (data) => {
        console.log(data)
    })
})


server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});