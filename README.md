# ScrapVideoSite

This project provides a simple Node.js-based web scraper and a real-time server for scraping and broadcasting data from directory-style video listing web pages. It consists of two main scripts: `scrap.js` and `server.js`.

## Overview

- **scrap.js**: Standalone script for scraping a given URL and logging the results to the console.
- **server.js**: Express server with Socket.IO support, allowing clients to request scraping of a URL and receive the results in real time.

---

## 1. `scrap.js` — Standalone Scraper

### Purpose
Scrapes a directory-style web page (such as a file listing or index page) and logs information about each row (typically representing a file or folder) to the console.

### How It Works
- Uses `axios` to fetch the HTML content of the provided URL.
- Loads the HTML into `cheerio` for jQuery-like DOM parsing.
- Selects all `<tr>` elements (table rows) in the HTML.
- For each row:
  - Finds the first `<a>` (anchor) tag and extracts its `href` (link) and inner HTML (label).
  - Finds the `<td>` element with class `fb-d` (typically containing a date or metadata).
  - Logs the index, label, link, and date to the console if:
    - The row is among the first three, or
    - The `ignore` flag is set (used for recursive scraping).
  - If the row is the third one (index 2) and not ignoring, recursively scrapes the linked page (using the same origin and the found `href`).

### Data Structure Returned
- **Not returned, but logged:**
  - **Index**: Row number in the table.
  - **Label**: Text inside the anchor tag (e.g., file or folder name).
  - **Link**: Value of the `href` attribute (relative or absolute URL).
  - **Date**: Text content of the `<td class="fb-d">` (if present).

### Example Output
```
0 SomeFile.mp4 /files/SomeFile.mp4 2023-10-01 12:00
1 AnotherFile.mkv /files/AnotherFile.mkv 2023-10-01 12:05
2 Subfolder /subfolder/ 2023-10-01 12:10
```

---

## 2. `server.js` — Real-Time Scraper Server

### Purpose
Provides an HTTP server with Socket.IO for real-time communication. Allows clients to request scraping of a URL and receive each row's data as it is found.

### How It Works
- Sets up an Express server with CORS enabled.
- Integrates Socket.IO for real-time, event-based communication.
- On client connection:
  - Listens for a `scrape` event with a URL payload.
  - Calls the `scrapeWebsite` function to scrape the provided URL.
  - For each row found (as in `scrap.js`):
    - Emits a `scrapedRow` event to all connected clients with the following data:
      - `label`: Text inside the anchor tag.
      - `link`: Value of the `href` attribute.
      - `date`: Text content of the `<td class="fb-d">`.
- Also listens for a `testData` event (for debugging/logging purposes).

### Data Structure Returned (via Socket.IO)
Each row is sent as an object:
```json
{
  "label": "SomeFile.mp4",
  "link": "/files/SomeFile.mp4",
  "date": "2023-10-01 12:00"
}
```

### Example Client Usage
A client can connect via Socket.IO, emit a `scrape` event with a URL, and listen for `scrapedRow` events to receive the data in real time.

---

## Technologies Used
- **Node.js**
- **axios**: For HTTP requests
- **cheerio**: For HTML parsing
- **express**: Web server
- **socket.io**: Real-time communication
- **cors**: Cross-origin resource sharing

---

## How to Run

### 1. Standalone Scraper
```sh
node scrap.js
```
- Edit the URL in `scrap.js` to the target page you want to scrape.

### 2. Real-Time Server
```sh
node server.js
```
- Connect a Socket.IO client to `http://localhost:3081`.
- Emit a `scrape` event with the target URL.
- Listen for `scrapedRow` events for results.

---

## Notes
- The scraper is designed for directory-style pages (e.g., Apache/Nginx file listings or similar HTML tables).
- The recursive scraping in `scrap.js` only follows the third row's link once, for demonstration.
- No data is saved to disk by default (commented-out code for writing HTML snippets is present).
- Error handling is basic; production use may require enhancements.

---

## Example Directory Structure
```
project/
├── package.json
├── pnpm-lock.yaml
├── scrap.js
└── server.js
```

---

## License
MIT (add your own license as needed)
