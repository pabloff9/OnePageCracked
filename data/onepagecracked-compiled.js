const mainSection = getArticleSectionElementFromDocument(document);
var numberOfPages = 0;
const articleSectionsFromTheOtherPages = [];
const INDEX_OF_SECOND_PAGE = 2;
var goToNextArticleAnchor;
var urlsOfFollowingPages;

if (mainSection !== null && typeof mainSection !== "undefined") {
    numberOfPages = findNumberOfPages();
    urlsOfFollowingPages = findUrlsOfFollowingPages(window.location.href, numberOfPages);

    for (let i = INDEX_OF_SECOND_PAGE; i <= numberOfPages; i++) {
        fetchContentFromPageAndAppendWhenReady(urlsOfFollowingPages[i - INDEX_OF_SECOND_PAGE], i);
    }
}

function findNumberOfPages() {
    return Number(document.getElementsByClassName("paginationNumber")[1].textContent);
}

function findUrlsOfFollowingPages(urlOfFirstPage, totalNumberOfPages) {
    const titlePortionOfFirstPage = findTitlePortionOfTheUrl(urlOfFirstPage);
    let urlsOfAllPages = [];
    for (let i = 2; i <= totalNumberOfPages; i++) {
        const titlePortionOfThisPage = titlePortionOfFirstPage + "_p" + i;
        const urlOfNextPage = urlOfFirstPage.replace(titlePortionOfFirstPage, titlePortionOfThisPage);
        urlsOfAllPages.push(urlOfNextPage);
    }
    return urlsOfAllPages;
}

function findTitlePortionOfTheUrl(urlOfFirstPage) {
    const regexp = /http:\/\/www.cracked.com\/(?:(?:blog|article)\/)?([^\/]*)(?:\/|\.html).*/;
    const info = regexp.exec(urlOfFirstPage);
    return info[1];
}

function fetchContentFromPageAndAppendWhenReady(url, pageNumber) {

    let requestForPage = new XMLHttpRequest();
    requestForPage.open("GET", url, true);
    requestForPage.onload = function () {
        if (requestForPage.readyState === XMLHttpRequest.DONE) {
            if (requestForPage.status === 200) {
                const parser = new DOMParser();
                const parsedDocument = parser.parseFromString(requestForPage.response, "text/html");
                articleSectionsFromTheOtherPages[pageNumber] = getArticleSectionElementFromDocument(parsedDocument);

                if (pageNumber === numberOfPages) {
                    goToNextArticleAnchor = parsedDocument.getElementsByClassName("blueArrowNext")[0];
                }

                if (areAllPagesLoaded()) {
                    appendContentToThisPage();
                    repositionSocialAndPaginationButtons();
                    updatePagesCount();
                    replaceNextPageWithNextArticle();
                }
            }
        }
    };

    requestForPage.send(null);
}

function repositionSocialAndPaginationButtons() {
    var likeOnFacebookWidget = document.getElementsByClassName("FacebookLike")[0];
    var paginationNavBar = document.getElementsByClassName("PaginationContent")[0];
    var shareButtons = document.getElementsByClassName("socialShareAfterContent")[0];
    likeOnFacebookWidget.parentElement.removeChild(likeOnFacebookWidget);
    paginationNavBar.parentElement.removeChild(paginationNavBar);
    shareButtons.parentElement.removeChild(shareButtons);

    mainSection.parentNode.appendChild(likeOnFacebookWidget);
    mainSection.parentNode.appendChild(paginationNavBar);
    mainSection.parentNode.appendChild(shareButtons);
}

function updatePagesCount() {
    var totalPagesNumberElement = document.getElementsByClassName("paginationNumber")[1];
    totalPagesNumberElement.textContent = "1";
}
function replaceNextPageWithNextArticle() {
    var nextPageAnchor = document.getElementsByClassName("next")[0];
    var parent = nextPageAnchor.parentElement;
    parent.removeChild(nextPageAnchor);
    parent.appendChild(goToNextArticleAnchor);
}

function areAllPagesLoaded() {
    for (let i = INDEX_OF_SECOND_PAGE; i <= numberOfPages; i++) {
        if (typeof articleSectionsFromTheOtherPages[i] === "undefined") {
            return false;
        }
    }
    return true;
}

function appendContentToThisPage() {
    for (let i = INDEX_OF_SECOND_PAGE; i <= numberOfPages; i++) {
        const articleSectionFromTheOtherPage = articleSectionsFromTheOtherPages[i];
        loadAllImagesFromArticleSection(articleSectionFromTheOtherPage);
        mainSection.parentNode.appendChild(articleSectionFromTheOtherPage);
    }
}

function loadAllImagesFromArticleSection(section) {
    var allImageElements = section.getElementsByTagName("img");
    for (let i = 0; i < allImageElements.length; i++) {
        const imageElement = allImageElements[i];
        const imageUrl = imageElement.getAttribute("data-img");
        imageElement.removeAttribute("data-img");
        imageElement.src = imageUrl;
    }
}

function getArticleSectionElementFromDocument(htmlDocument) {
    // var rightSide = htmlDocument.getElementById("safePlace");
    var article = htmlDocument.getElementsByTagName("article")[0];
    if (article !== null && typeof article === "undefined") {
        const bodySection = article.getElementsByTagName("section")[0];
        return bodySection.getElementsByTagName("section")[0];
    }
}

//# sourceMappingURL=onepagecracked-compiled.js.map