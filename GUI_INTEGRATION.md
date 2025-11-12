# GUI Developer Integration Guide

This document explains how to integrate your GUI (frontend) with the Node.js real-time scraping server (`server.js`). The backend uses Socket.IO to communicate with clients, allowing you to request scraping of a URL and receive results in real time.

---

## 1. Connect to the Server

- The backend server runs on: `http://localhost:3081`
- Communication is via [Socket.IO](https://socket.io/)
- You can use the official Socket.IO client library for your frontend framework (React, Vue, Angular, plain JS, etc.)

### Example (JavaScript/HTML):
```html
<script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
<script>
  // Connect to the backend server
  const socket = io('http://localhost:3081');

  // Listen for connection
  socket.on('connect', () => {
    console.log('Connected to scraping server');
  });
</script>
```

---

## 2. Request a Scrape

- To start scraping a URL, emit a `scrape` event with the target URL as a string.

### Example:
```js
socket.emit('scrape', 'http://example.com/path/to/listing/');
```

---

## 3. Receive Scraped Data

- The server will emit a `scrapedRow` event for each row found in the table.
- Each event contains an object with the following structure:
  - `label`: The text inside the anchor tag (e.g., file or folder name)
  - `link`: The `href` attribute (relative or absolute URL)
  - `date`: The text content of the `<td class="fb-d">` (date or metadata)

### Example:
```js
socket.on('scrapedRow', (row) => {
  // row = { label: 'SomeFile.mp4', link: '/files/SomeFile.mp4', date: '2023-10-01 12:00' }
  // Display or process the row in your UI
  console.log(row);
});
```

---

## 4. Optional: Debugging

- You can emit a `testData` event with any data for debugging; the server will log it.

### Example:
```js
socket.emit('testData', { foo: 'bar' });
```

---

## 5. Full Example (HTML + JS)
```html
<script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
<script>
  const socket = io('http://localhost:3081');

  socket.on('connect', () => {
    console.log('Connected');
    // Start scraping when connected
    socket.emit('scrape', 'http://example.com/path/to/listing/');
  });

  socket.on('scrapedRow', (row) => {
    // Add row to your UI (table, list, etc.)
    console.log('Scraped:', row);
  });
</script>
```

---

## 6. UI Implementation Suggestions
- Provide an input field for the user to enter the URL to scrape.
- Show a loading indicator while scraping is in progress.
- Display each `scrapedRow` as it arrives (e.g., in a table or list).
- Optionally, allow the user to stop or restart scraping.
- Handle errors gracefully (e.g., if the server is unreachable or the URL is invalid).

---

## 7. Notes
- The backend expects directory-style pages with table rows (`<tr>`) and anchor tags (`<a>`).
- The server emits each row as soon as it is found; you can update the UI in real time.
- The server is CORS-enabled, so you can connect from any frontend origin during development.

---

## 8. Resources
- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
- [Socket.IO CDN](https://cdn.socket.io/)

---

For any backend changes or questions, contact the backend developer.
