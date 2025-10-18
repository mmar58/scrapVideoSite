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


var curUrl;
const scrapeWebsite = async (url) => {
    try {
        // Fetch the HTML from the URL
        const { data: html } = await axios.get(url);
        curUrl = new URL(url)
        const $ = cheerio.load(html);

        let body = $("html").find("tr")
        body.each((i, el) => {
            let test = $(el).find("a")
            let href = test.attr("href")
            let date = $(el).find("td.fb-d")
            if (test.html() != null && href != "..") {
                // Send row data to all connected clients
                io.emit("scrapedRow", {
                    label: test.html(),
                    link: href,
                    date: date.text()
                });
            }
        })
    } catch (error) {
        console.error('Error scraping:', error.message);
    }
};

// scrapeWebsite('http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%99%A5%20%20A%20%20%E2%80%94%20%20L/');
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('scrape', (url) => {
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