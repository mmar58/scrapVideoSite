import { MediaCategory } from "../types/mediaTypes";
export function isIncludeLinkInMedia(href: string, mediaList: MediaCategory[]): boolean {
    let found = mediaList.find((media) => media.link === href|| media.parentLink === href);
    if (found) {
        return true;
    }
    return false;
}