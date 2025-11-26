// Load environment variables from .env file
import 'dotenv/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { detectLinkType, getFullLink } from './util/linkUtil';
import { knex } from './lib/knex';
import { scrapLink } from './types/dataTypes';
import { MediaCategory } from './types/mediaTypes';
import { isIncludeLinkInMedia } from './util/helper';
import { link } from 'fs';
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
let rootLinks: MediaCategory[] = [];


const scrapeWebsite = async (data: scrapLink) => {
    try {
        console.log('scraping', data.url);
        if (data.parent.length > 0 && !isIncludeLinkInMedia(data.parent[0], rootLinks)) {
            io.emit("scrapeError", { message: "Parent link not found in root links", parentLink: data.parent[0],rootLinks });
            console.log("Doesn't include parent in the root link:", data.url);
            return;
        }
        // Fetch the HTML from the URL
        let currentUrl = "" + data.url;
        currentUrl = getFullLink(currentUrl);
        if(data.parentScrapCompleted){
            let subLinks = await knex<MediaCategory>("links").where("parentId", data.id || -999);
            subLinks.forEach((subLink) => {
                if(!subLink.linkType){
                    io.emit("scrapeError", { source:"Parent Scrap completed", message: "Link type missing in database", link: subLink });
                }
                
            });
        }
        const { data: html } = await axios.get(currentUrl);
        const $ = cheerio.load(html);
        let scrappedData: MediaCategory[] = [];
        let listOfLinksToScrap: scrapLink[] = [];
        let body = $("html").find("tr")
        let currentImageLink = "";
        body.each((i: number, el: any) => {
            let test = $(el).find("a")
            let href = test.attr("href")
            let date = $(el).find("td.fb-d")
            if (test.html() != null && href && href != "..") {
                href = getFullLink(href);
                let linkType = detectLinkType(href);
                // Skip image links
                if (linkType === 'image') {
                    currentImageLink = getFullLink(href);
                }
                // Prepare scrapped row
                else {
                    let scrappedRow: MediaCategory = {
                        id: rootLinks.length.toString(),
                        title: test.html() || "",
                        link: href,
                        date: date.text(),
                        linkType: linkType,
                        parentLink: currentUrl
                    }
                    if (data.parent.length === 0 && !isIncludeLinkInMedia(href, rootLinks)) {
                        rootLinks.push(
                            scrappedRow
                        );
                    }
                    if (linkType !== 'link' && data.parent.length > 0) {
                        let targetMedia:MediaCategory|null = null
                        if(data.parent.length > 1){
                            targetMedia = rootLinks.find((media) => media.link==data.url||media.link === data.parent[1])||null;
                        }
                        else{
                            targetMedia = rootLinks.find((media) => media.link === data.url)||null;
                        }

                        if(targetMedia){
                            // console.log('Updating item count for media:', targetMedia);
                            if(targetMedia.filesCount){
                                targetMedia.filesCount += 1;
                            }
                            else {
                                targetMedia.filesCount = 1;
                            }
                        }
                        else{
                            console.log('Target media not found for link:',data);
                        }
                    }
                    if(linkType === 'link'){
                        listOfLinksToScrap.push({ url: href, parent: [...data.parent, currentUrl] });
                    }
                    scrappedData.push(scrappedRow);
                }
            }
        })
        // If image link found, associate it with the last scrapped data
        if(currentImageLink != ""){
            // console.log('Associating image link:', currentImageLink);
            if(data.parent.length == 0){
                rootLinks.forEach(element => {
                    element.imageUrl = currentImageLink;
                });
            }
            if(data.parent.length == 1){
                let targetMedia = rootLinks.find((media) => media.link === data.url);
                if(targetMedia){
                    targetMedia.imageUrl = currentImageLink;
                }
            }
            else{
                let targetMedia = rootLinks.find((media) => media.link === data.url || media.link === data.parent[1]);
                if(targetMedia){
                    targetMedia.imageUrl = currentImageLink;
                }
            }
        }
        io.emit("scrapedRow", rootLinks);
        for (const element of listOfLinksToScrap) {
            scrapeWebsite(element);
        }
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
        rootLinks = [];
        scrapeWebsite({ url, parent: [] });
    });
    socket.on('testData', (data: any) => {
        console.log(data)
    })
})


server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
