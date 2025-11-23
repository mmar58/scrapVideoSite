// Load environment variables from .env file
import 'dotenv/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { getFullLink } from './util/linkUtil';
import { knex } from './lib/knex';
import { scrapLink } from './types/dataTypes';
import { MediaCategory } from './types/mediaTypes';
const port = process.env.PORT || 3081;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
app.use(cors());



const scrapeWebsite = async (data: scrapLink) => {
    try {
        // Fetch the HTML from the URL
        let currentUrl = ""+data.url;
        currentUrl = getFullLink(currentUrl);
        const { data: html } = await axios.get(currentUrl);
        const $ = cheerio.load(html);
        let scrappedData: MediaCategory[] = [];
        let body = $("html").find("tr")
        body.each((i: number, el: any) => {
            let test = $(el).find("a")
            let href = test.attr("href")
            let date = $(el).find("td.fb-d")
            if (test.html() != null && href && href != "..") {
                href = getFullLink(href);
                let scrappedRow:MediaCategory = {
                    id:i.toString(),
                    title: test.html() || "",
                    link: href,
                    date: date.text(),
                    parentLink: currentUrl
                }
                // Check and insert in background (non-blocking)
                knex('links_progress').where({ link: href }).first().then((existingData: any) => {
                    if(!existingData){
                        knex('links_progress').insert({ link: href }).catch(console.error);
                    }
                });
                scrappedData.push(scrappedRow);
                // Send row data to all connected clients
                
                // console.log(i,scrappedRow);
            }
        })
        io.emit("scrapedRow", scrappedData);
    } catch (error: any) {
        console.error('Error scraping:', error.message);
        io.emit("scrapeError", { message: "Error occurred during scraping" });
    }
};

// scrapeWebsite('http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%99%A5%20%20A%20%20%E2%80%94%20%20L/');
io.on('connection', (socket: any) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('scrap', (url: string) => {
        console.log('scraping', url);
        scrapeWebsite({url,parent:[]});
    });
    socket.on('testData', (data: any) => {
        console.log(data)
    })
})


server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
