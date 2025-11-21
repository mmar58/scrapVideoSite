const scrapeParentLink = 'http://172.16.50.14';
export function getFullLink(href: string): string {
    if(!href.includes("http")){
            if(href.startsWith("/")){
                href = scrapeParentLink + href;
            }else{
                href = scrapeParentLink + "/" + href;
            }
        }
    return href;
}