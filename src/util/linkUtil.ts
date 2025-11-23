const scrapeParentLink = 'http://172.16.50.14';
export function getFullLink(href: string): string {
    if (!href) return href;
    if (!href.includes("http")) {
        if (href.startsWith("/")) {
            href = scrapeParentLink + href;
        } else {
            href = scrapeParentLink + "/" + href;
        }
    }
    return href;
}

export type LinkType = 'video' | 'image' | 'link';

const VIDEO_EXTS = new Set([
    'mp4','mkv','webm','mov','avi','mpeg','mpg','flv','m4v','3gp','ogg'
]);
const IMAGE_EXTS = new Set([
    'jpg','jpeg','png','gif','webp','svg','bmp','ico','tif','tiff'
]);

/**
 * Detects whether a URL likely points to a video file, an image file, or
 * is just a normal link (HTML page / directory / other).
 *
 * Heuristics used:
 * - checks file extension in the path
 * - supports `data:` URLs
 * - looks for well-known video hostnames / embed/watch patterns
 *
 * Returns: 'video' | 'image' | 'link'
 */
export function detectLinkType(href: string): LinkType {
    if (!href) return 'link';

    // data URLs
    if (href.startsWith('data:')) {
        if (href.startsWith('data:image')) return 'image';
        if (href.startsWith('data:video')) return 'video';
        return 'link';
    }

    // try to parse with URL; fallback to simple checks
    let url: URL | null = null;
    try {
        url = new URL(href, scrapeParentLink);
    } catch (e) {
        url = null;
    }

    // check extension on pathname
    if (url) {
        const pathname = url.pathname || '';
        const lastDot = pathname.lastIndexOf('.');
        if (lastDot !== -1) {
            const ext = pathname.slice(lastDot + 1).toLowerCase();
            if (VIDEO_EXTS.has(ext)) return 'video';
            if (IMAGE_EXTS.has(ext)) return 'image';
        }

        // known video-host heuristics
        const host = url.hostname.toLowerCase();
        if (/\b(youtube|youtu\.be|vimeo|dailymotion)\b/.test(host) || href.includes('watch?v=') || href.includes('/embed/')) {
            return 'video';
        }
    } else {
        // no URL parse — fallback to simple filename pattern
        const m = href.split('?')[0].split('#')[0];
        const lastDot = m.lastIndexOf('.');
        if (lastDot !== -1) {
            const ext = m.slice(lastDot + 1).toLowerCase();
            if (VIDEO_EXTS.has(ext)) return 'video';
            if (IMAGE_EXTS.has(ext)) return 'image';
        }
    }

    return 'link';
}

// Example usage:
// detectLinkType('http://example.com/video.mp4') -> 'video'
// detectLinkType('/images/logo.png') -> 'image'
// detectLinkType('https://youtube.com/watch?v=abc') -> 'video'