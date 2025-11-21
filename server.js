// Load environment variables from .env file
require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const {getFullLink} = require('./scripts/util/linkUtil');
let port = process.env.PORT || 3081;
const app = express();
const server = http.createServer(app);
const knex = require('./scripts/lib/knex');
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());



const scrapeWebsite = async (data) => {
    try {
        // Fetch the HTML from the URL
        let currentUrl = ""+data.url;
        currentUrl = getFullLink(currentUrl);
        const { data: html } = await axios.get(currentUrl);
        const $ = cheerio.load(html);
        let scrappedData = [];
        let body = $("html").find("tr")
        body.each(async(i, el) => {
            let test = $(el).find("a")
            let href = test.attr("href")
            let date = $(el).find("td.fb-d")
            if (test.html() != null && href != "..") {
                href = getFullLink(href);
                let scrappedRow = {
                    id:i,
                    title: test.html(),
                    link: href,
                    date: date.text(),
                    parentLink: currentUrl
                }
                let existingData = await knex('links_progress').where({ link: href }).first();
                if(!existingData){
                    await knex('links_progress').insert({
                        link: href
                    })
                }
                scrappedData.push(scrappedRow);
                // Send row data to all connected clients
                
                // console.log(i,scrappedRow);
            }
        })
        io.emit("scrapedRow", scrappedData);
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
        scrapeWebsite({url,parent:[]});
    });
    socket.on('testData', (data) => {
        console.log(data)
    })
})


server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});