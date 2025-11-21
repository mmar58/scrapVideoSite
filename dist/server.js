"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables from .env file
require("dotenv/config");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const linkUtil_1 = require("./util/linkUtil");
const knex_1 = require("./lib/knex");
const port = process.env.PORT || 3081;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
app.use((0, cors_1.default)());
const scrapeWebsite = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch the HTML from the URL
        let currentUrl = "" + data.url;
        currentUrl = (0, linkUtil_1.getFullLink)(currentUrl);
        const { data: html } = yield axios_1.default.get(currentUrl);
        const $ = cheerio.load(html);
        let scrappedData = [];
        let body = $("html").find("tr");
        body.each((i, el) => {
            let test = $(el).find("a");
            let href = test.attr("href");
            let date = $(el).find("td.fb-d");
            if (test.html() != null && href && href != "..") {
                href = (0, linkUtil_1.getFullLink)(href);
                let scrappedRow = {
                    id: i,
                    title: test.html(),
                    link: href,
                    date: date.text(),
                    parentLink: currentUrl
                };
                // Check and insert in background (non-blocking)
                (0, knex_1.knex)('links_progress').where({ link: href }).first().then((existingData) => {
                    if (!existingData) {
                        (0, knex_1.knex)('links_progress').insert({ link: href }).catch(console.error);
                    }
                });
                scrappedData.push(scrappedRow);
                // Send row data to all connected clients
                // console.log(i,scrappedRow);
            }
        });
        io.emit("scrapedRow", scrappedData);
    }
    catch (error) {
        console.error('Error scraping:', error.message);
        io.emit("scrapeError", { message: "Error occurred during scraping" });
    }
});
// scrapeWebsite('http://172.16.50.12/DHAKA-FLIX-12/TV-WEB-Series/TV%20Series%20%E2%99%A5%20%20A%20%20%E2%80%94%20%20L/');
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('scrap', (url) => {
        console.log('scraping', url);
        scrapeWebsite({ url, parent: [] });
    });
    socket.on('testData', (data) => {
        console.log(data);
    });
});
server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
