interface CrackedPost {
    getUrl(): string;
    numberOfPages(): number;
    urlsOfThePagesOtherThanTheFirst(): string[];
    titlePortionOfTheUrl(): string;
    updatePagesCount(): void;
}

class CrackedArticle implements CrackedPost {

    private url;
    private pagesOtherThanTheFirst: HTMLDocument[];

    constructor(url) {
        this.url = url;
        this.pagesOtherThanTheFirst = [];
    }

    loadAllPages(): void {
        let urlsOfTheNextPages = this.urlsOfThePagesOtherThanTheFirst();
        /* tslint:disable: no-var-keyword */
        for (var i = 0; i < urlsOfTheNextPages.length; i++) {
        /* ts:lint:enable: no-var-keyword */
            this.loadPage(urlsOfTheNextPages[i], i, (pageNumber: number, pageContent: HTMLDocument): void => {
                this.pagesOtherThanTheFirst[pageNumber] = pageContent;
                this.loadAllImagesFromPage(pageNumber);
                if (this.areAllPagesLoaded()) {
                    this.appendOtherPagesToTheFirstPage();
                    this.repositionSocialAndPaginationButtons();
                    this.updatePagesCount();
                    this.replaceNextPageWithNextArticle();
                }
            });
        }
    }

    private loadPage(url: string, pageNumber: number, onPageLoaded: (pageNumber: number, pageContent: HTMLDocument) => void): void {
        let requestForPage = new XMLHttpRequest();
        requestForPage.open("GET", url, true);
        requestForPage.onload = () => {
            if (requestForPage.readyState === XMLHttpRequest.DONE) {
                if (requestForPage.status === 200) {
                    const parser = new DOMParser();
                    onPageLoaded(pageNumber, parser.parseFromString(requestForPage.response, "text/html"));
                }
            }
        };

        requestForPage.send(null);
    }

    updatePagesCount (): void {
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

        this.getContentElementFromPage(document).appendChild(likeOnFacebookWidget);
        this.getContentElementFromPage(document).parentNode.appendChild(paginationNavBar);
        this.getContentElementFromPage(document).parentNode.appendChild(shareButtons);
    }

    private appendOtherPagesToTheFirstPage(): void {
        let elementToAppendContentTo = this.getContentElementFromPage(document);
        for (let i = 0; i < this.pagesOtherThanTheFirst.length; i++) {
            let contentToBeAdded = this.getContentElementFromPage(this.pagesOtherThanTheFirst[i]);
            elementToAppendContentTo.parentNode.appendChild(contentToBeAdded);
        }
    }

    private getContentElementFromPage(page: HTMLDocument): HTMLElement {
        let article = page.getElementsByTagName("article")[0];
        if (article !== null && typeof (article) !== "undefined") {
            const bodySection = article.getElementsByTagName("section")[0];
            return bodySection.getElementsByTagName("section")[0];
        }
    }

    private areAllPagesLoaded(): boolean {
        for (let i = 0; i < this.numberOfPages() - 1; i++) {
            if (this.pagesOtherThanTheFirst[i] === undefined) {
                return false;
            }
        }
        return true;
    }

    private loadAllImagesFromPage(pageNumber: number): void {
        const allImageElements = this.pagesOtherThanTheFirst[pageNumber].getElementsByTagName("img");
        for (let i = 0; i < allImageElements.length; i++) {
            const imageElement = allImageElements[i];
            const imageUrl = imageElement.getAttribute("data-img");
            imageElement.removeAttribute("data-img");
            imageElement.src = imageUrl;
        }
    }

    getUrl(): string {
        return this.url;
    }

    numberOfPages(): number {
        return Number(document.getElementsByClassName("paginationNumber")[1].textContent);
    }

    urlsOfThePagesOtherThanTheFirst(): string[] {
        const urlsOfAllPages = [];
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

    private replaceNextPageWithNextArticle (): void {
        const nextPageAnchor = document.getElementsByClassName("next")[0];
        const parent = nextPageAnchor.parentElement;
        parent.removeChild(nextPageAnchor);
        parent.appendChild(this.getNextArticleAnchor());
    }

    private getNextArticleAnchor(): Element {
        return this.pagesOtherThanTheFirst[this.pagesOtherThanTheFirst.length - 1].getElementsByClassName("blueArrowNext")[0];
    }

}

//function areWeOnTheMobileVersion(): boolean {
//    return document.getElementById("mobileWrapper") != null ; // this might break anytime. Stay alert.
//}

window.onload = () => {
    let article = new CrackedArticle(window.location.href);
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
