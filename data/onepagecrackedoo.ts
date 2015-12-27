interface CrackedPost {
    getUrl(): string;
    numberOfPages(): number;
    urlsOfThisArticlesPages(): string[];
    titlePortionOfTheUrl(): string;
    updatePagesCount(): void;
}

interface CrackedPage {
    getPageNumber(): number;
    getUrl(): string;
    isLoaded(): boolean;
    load(onDone: () => void): void;
    loadAllImages(): void;
    appendContentFromPage(page: CrackedPage): void;
    getContentElement(): Element;
    getHTMLDocument(): HTMLDocument;
}

class CrackedArticle implements CrackedPost {

    private pages: CrackedPage[];
    private url;

    constructor(url) {
        this.url = url;
        this.pages = [];
        let urlsOfThePages = this.urlsOfThisArticlesPages();

        let firstPage = new CrackedArticlePage(urlsOfThePages[0], 0, true);
        this.pages.push(firstPage);

        for (let i = 2; i <= urlsOfThePages.length; i++) {
            let page = new CrackedArticlePage(urlsOfThePages[i - 1], i, false);
            this.pages.push(page);
        }

    }

    loadAllPages(): void {
        for (let i = 1; i < this.pages.length; i++) {
            this.pages[i].load((): void => {
                if (this.areAllPagesLoaded()) {
                    this.appendOtherPagesToTheFirstPage();
                    this.repositionSocialAndPaginationButtons();
                    this.updatePagesCount();
                    this.replaceNextPageWithNextArticle();
                }
            });
        }
    }

    updatePagesCount () : void {
        const totalPagesNumberElement = document.getElementsByClassName("paginationNumber")[1];
        totalPagesNumberElement.textContent = "1";
    }

    private repositionSocialAndPaginationButtons(): void {
        const likeOnFacebookWidget = document.getElementsByClassName("FacebookLike")[0];
        const paginationNavBar = document.getElementsByClassName("PaginationContent")[0];
        const shareButtons = document.getElementsByClassName("socialShareAfterContent")[0];
        likeOnFacebookWidget.parentElement.removeChild(likeOnFacebookWidget);
        paginationNavBar.parentElement.removeChild(paginationNavBar);
        shareButtons.parentElement.removeChild(shareButtons);

        this.pages[0].getContentElement().parentNode.appendChild(likeOnFacebookWidget);
        this.pages[0].getContentElement().parentNode.appendChild(paginationNavBar);
        this.pages[0].getContentElement().parentNode.appendChild(shareButtons);
    }

    private appendOtherPagesToTheFirstPage(): void {
        for (let i = 1; i < this.pages.length; i++) {
            this.pages[i].loadAllImages();
            this.pages[0].appendContentFromPage(this.pages[i]);
        }
    }

    private areAllPagesLoaded() : boolean {
        for (let page of this.pages) {
            if (!page.isLoaded()) {
                return false;
            }
        }
        return true;
    }

    getUrl(): string {
        return this.url;
    }

    numberOfPages(): number {
        return Number(document.getElementsByClassName("paginationNumber")[1].textContent);
    }

    urlsOfThisArticlesPages(): string[] {
        const urlsOfAllPages = [];
        urlsOfAllPages.push(this.url);

        const titlePortionOfFirstPage = this.titlePortionOfTheUrl();
        for (let i = 2; i <= this.numberOfPages(); i++) {
            const titlePortionOfThisPage = titlePortionOfFirstPage + "_p" + i;
            const urlOfNextPage = this.url.replace(titlePortionOfFirstPage, titlePortionOfThisPage);
            urlsOfAllPages.push(urlOfNextPage);
        }
        return urlsOfAllPages;
    }

    titlePortionOfTheUrl(): string {
        const regexp = /http:\/\/www.cracked.com\/(?:(?:blog|article)\/)?([^\/]*)(?:\/|\.html).*/;
        let info = regexp.exec(this.url);
        return info[1];
    }

    private replaceNextPageWithNextArticle () : void {
        const nextPageAnchor = document.getElementsByClassName("next")[0];
        const parent = nextPageAnchor.parentElement;
        parent.removeChild(nextPageAnchor);
        parent.appendChild(this.getNextArticleAnchor());
    }

    private getNextArticleAnchor() : Element {
        return this.pages[this.pages.length-1].getHTMLDocument().getElementsByClassName("blueArrowNext")[0]
    }

}

class CrackedArticlePage implements CrackedPage {

    private htmlDocument: Document;
    private url: string;
    private loaded: boolean;
    private pageNumber: number;

    constructor(pageUrl: string, pageNumber: number, isFirstPage: boolean) {
        this.url = pageUrl;
        this.pageNumber = pageNumber;

        if (isFirstPage) {
            this.htmlDocument = document;
            this.loaded = true;
        } else {
            this.loaded = false;
            this.htmlDocument = null;
        }

    }

    isLoaded(): boolean {
        return this.loaded;
    }

    appendContentFromPage(page: CrackedPage): void {
        this.getContentElement().parentNode.appendChild(page.getContentElement())
    }

    getContentElement(): Element {
        let article = this.htmlDocument.getElementsByTagName("article")[0];
        if (article !== null && typeof (article) !== "undefined") {
            const bodySection = article.getElementsByTagName("section")[0];
            return bodySection.getElementsByTagName("section")[0];
        }
    }

    getHTMLDocument(): Document {
        return this.htmlDocument;
    }

    load(onDone: () => void): void {
        let requestForPage = new XMLHttpRequest();
        requestForPage.open("GET", this.url, true);
        requestForPage.onload = () => {
            if (requestForPage.readyState === XMLHttpRequest.DONE) {
                if (requestForPage.status === 200) {
                    const parser = new DOMParser();
                    this.htmlDocument = parser.parseFromString(requestForPage.response, "text/html");
                    this.loaded = true;
                    onDone();
                }
            }
        };

        requestForPage.send(null);
    }

    getUrl(): string {
        return this.url;
    }

    getPageNumber(): number {
        return this.pageNumber;
    }

    loadAllImages(): void {
        const allImageElements = this.htmlDocument.getElementsByTagName("img");
        for (let i = 0; i < allImageElements.length; i++) {
            const imageElement = allImageElements[i];
            const imageUrl = imageElement.getAttribute("data-img");
            imageElement.removeAttribute("data-img");
            imageElement.src = imageUrl;
        }
    }

}

window.onload = () => {
    var article = new CrackedArticle(window.location.href);
    article.loadAllPages();
};





///**
// * Created by pablo on 20/12/15.
// */
//const articleElement = getArticleElementFromDocument(document);
//let numberOfPages = 0;
//const articlesFromOtherPages : HTMLElement[] = [];
//const INDEX_OF_SECOND_PAGE = 2;
//let goToNextArticleAnchor : Element = null;
//
//if (articleElement !== null && typeof (articleElement) !== "undefined") {
//    numberOfPages = findNumberOfPages();
//    const urlsOfFollowingPages = findUrlsOfFollowingPages(window.location.href);
//
//    for (let i = INDEX_OF_SECOND_PAGE; i <= numberOfPages; i++) {
//        fetchContentFromPageAndAppendWhenReadyMobile(urlsOfFollowingPages[i - INDEX_OF_SECOND_PAGE], i);
//    }
//
//}

//function findNumberOfPages () : number {
//    return Number(document.getElementsByClassName("paginationNumber")[1].textContent);
//}
//
//function findUrlsOfFollowingPages (urlOfFirstPage) : string [] {
//    let titlePortionOfFirstPage = findTitlePortionOfTheUrl(urlOfFirstPage);
//    let urlsOfAllPages = [];
//    for (let i = 2; i <= numberOfPages; i++) {
//        const titlePortionOfThisPage = titlePortionOfFirstPage + "_p" + i;
//        const urlOfNextPage = urlOfFirstPage.replace(titlePortionOfFirstPage, titlePortionOfThisPage);
//        urlsOfAllPages.push(urlOfNextPage);
//    }
//    return urlsOfAllPages;
//}
//
//
//function findTitlePortionOfTheUrl (urlOfFirstPage) : string {
//    const regexp = /http:\/\/www.cracked.com\/(?:(?:blog|article)\/)?([^\/]*)(?:\/|\.html).*/;
//    let info = regexp.exec(urlOfFirstPage);
//    return info[1];
//}


//function fetchContentFromPageAndAppendWhenReadyMobile(url: string, pageNumber: number) : void {
//    let requestForPage = new XMLHttpRequest();
//    requestForPage.open("GET", url, true);
//    requestForPage.onload = function () {
//        if (requestForPage.readyState === XMLHttpRequest.DONE) {
//            if (requestForPage.status === 200) {
//                const parser = new DOMParser();
//                const parsedDocument = parser.parseFromString(requestForPage.response, "text/html");
//                articlesFromOtherPages[pageNumber] = getArticleElementFromDocument(parsedDocument);
//
//                if (pageNumber === numberOfPages) { // are we on the last page?
//                    goToNextArticleAnchor = parsedDocument.getElementsByClassName("blueArrowNext")[0];
//                }
//
//                if (areAllPagesLoaded()) {
//                    appendContentToThisPage();
//                    repositionSocialAndPaginationButtons();
//                    updatePagesCount();
//                    replaceNextPageWithNextArticle();
//                }
//
//            }
//        }
//    };
//
//    requestForPage.send(null);
//
//}

//function fetchContentFromPageAndAppendWhenReady (url: string, pageNumber: number) : void {
//
//    let requestForPage = new XMLHttpRequest();
//    requestForPage.open("GET", url, true);
//    requestForPage.onload = function () {
//        if (requestForPage.readyState === XMLHttpRequest.DONE) {
//            if (requestForPage.status === 200) {
//                const parser = new DOMParser();
//                const parsedDocument = parser.parseFromString(requestForPage.response, "text/html");
//                articlesFromOtherPages[pageNumber] = getArticleElementFromDocument(parsedDocument);
//
//                if (pageNumber === numberOfPages) { // are we on the last page?
//                    goToNextArticleAnchor = parsedDocument.getElementsByClassName("blueArrowNext")[0];
//                }
//
//                if (areAllPagesLoaded()) {
//                    appendContentToThisPage();
//                    repositionSocialAndPaginationButtons();
//                    updatePagesCount();
//                    replaceNextPageWithNextArticle();
//                }
//
//            }
//        }
//    };
//
//    requestForPage.send(null);
//
//}

//function repositionSocialAndPaginationButtons () : void {
//    const likeOnFacebookWidget = document.getElementsByClassName("FacebookLike")[0];
//    const paginationNavBar = document.getElementsByClassName("PaginationContent")[0];
//    const shareButtons = document.getElementsByClassName("socialShareAfterContent")[0];
//    likeOnFacebookWidget.parentElement.removeChild(likeOnFacebookWidget);
//    paginationNavBar.parentElement.removeChild(paginationNavBar);
//    shareButtons.parentElement.removeChild(shareButtons);
//
//    articleElement.parentNode.appendChild(likeOnFacebookWidget);
//    articleElement.parentNode.appendChild(paginationNavBar);
//    articleElement.parentNode.appendChild(shareButtons);
//}
//
//function updatePagesCount () : void {
//    const totalPagesNumberElement = document.getElementsByClassName("paginationNumber")[1];
//    totalPagesNumberElement.textContent = "1";
//}
//function replaceNextPageWithNextArticle () : void {
//    const nextPageAnchor = document.getElementsByClassName("next")[0];
//    const parent = nextPageAnchor.parentElement;
//    parent.removeChild(nextPageAnchor);
//    parent.appendChild(goToNextArticleAnchor);
//
//}
//
//function areAllPagesLoaded () : boolean {
//    for (let i = INDEX_OF_SECOND_PAGE; i <= numberOfPages; i++) {
//        if (typeof (articlesFromOtherPages[i]) === "undefined") {
//            return false;
//        }
//    }
//    return true;
//}
//
//function appendContentToThisPage () : void {
//    for (let i = INDEX_OF_SECOND_PAGE; i <= numberOfPages; i++) {
//        const articleSectionFromTheOtherPage = articlesFromOtherPages[i];
//        loadAllImagesFromArticleSection(articleSectionFromTheOtherPage);
//        articleElement.parentNode.appendChild(articleSectionFromTheOtherPage);
//    }
//}
//
//function loadAllImagesFromArticleSection (section: HTMLElement) : void {
//    const allImageElements = section.getElementsByTagName("img");
//    for (let i = 0; i < allImageElements.length; i++) {
//        const imageElement = allImageElements[i];
//        const imageUrl = imageElement.getAttribute("data-img");
//        imageElement.removeAttribute("data-img");
//        imageElement.src = imageUrl;
//    }
//}

//function getArticleSectionElementFromDocument (htmlDocument: HTMLDocument): any {
//    const article = htmlDocument.getElementsByTagName("article")[0];
//    if (article !== null && typeof (article) !== "undefined") {
//        const bodySection = article.getElementsByTagName("section")[0];
//        return bodySection.getElementsByTagName("section")[0];
//    }
//}

//function getArticleElementFromDocument (htmlDocument: HTMLDocument): HTMLElement {
//    return htmlDocument.getElementsByTagName("article")[0];
//}
