"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullLink = getFullLink;
const scrapeParentLink = 'http://172.16.50.14';
function getFullLink(href) {
    if (!href.includes("http")) {
        if (href.startsWith("/")) {
            href = scrapeParentLink + href;
        }
        else {
            href = scrapeParentLink + "/" + href;
        }
    }
    return href;
}
