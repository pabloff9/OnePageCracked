const mainSection = getArticleSectionElementFromDocument(document);
let numberOfPages = 0;
const articleSectionsFromTheOtherPages = [];
const INDEX_OF_SECOND_PAGE = 2;
let goToNextArticleAnchor = null;

if (mainSection !== null && mainSection !== undefined) {
    numberOfPages = findNumberOfPages();
    urlsOfFollowingPages = findUrlsOfFollowingPages(window.location.href, numberOfPages);

    for (let i = INDEX_OF_SECOND_PAGE; i <=numberOfPages; i++) {
        fetchContentFromPageAndAppendWhenReady(urlsOfFollowingPages[i-INDEX_OF_SECOND_PAGE], i);
    }

}

function findNumberOfPages() {
    return Number(document.getElementsByClassName("paginationNumber")[1].textContent);
}

function findUrlsOfFollowingPages(urlOfFirstPage, numberOfPages) {
    let titlePortionOfFirstPage = findTitlePortionOfTheUrl(urlOfFirstPage);
    let urlsOfAllPages = [];
    for (let i = 2; i <= numberOfPages; i++) {
        const titlePortionOfThisPage = titlePortionOfFirstPage + "_p" + i;
        const urlOfNextPage = urlOfFirstPage.replace(titlePortionOfFirstPage, titlePortionOfThisPage);
        urlsOfAllPages.push(urlOfNextPage);
    }
    return urlsOfAllPages;
}


function findTitlePortionOfTheUrl(urlOfFirstPage) {
    const regexp = /http:\/\/www.cracked.com\/(?:(?:blog|article)\/)?([^\/]*)(?:\/|\.html).*/;
    let info = regexp.exec(urlOfFirstPage);
    return info[1];
}

function fetchContentFromPageAndAppendWhenReady(url, pageNumber) {

    let requestForPage = new XMLHttpRequest();
    requestForPage.open("GET", url, true);
    requestForPage.onload = function(e) {
        if (requestForPage.readyState === XMLHttpRequest.DONE) {
            if (requestForPage.status === 200) {
                parser = new DOMParser();
                parsedDocument = parser.parseFromString(requestForPage.response, "text/html");
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
    const likeOnFacebookWidget = document.getElementsByClassName("FacebookLike")[0];
    const paginationNavBar = document.getElementsByClassName("PaginationContent")[0];
    const shareButtons = document.getElementsByClassName("socialShareAfterContent")[0];
    likeOnFacebookWidget.parentElement.removeChild(likeOnFacebookWidget);
    paginationNavBar.parentElement.removeChild(paginationNavBar);
    shareButtons.parentElement.removeChild(shareButtons);

    mainSection.parentNode.appendChild(likeOnFacebookWidget);
    mainSection.parentNode.appendChild(paginationNavBar);
    mainSection.parentNode.appendChild(shareButtons);
}

function updatePagesCount() {
    const totalPagesNumberElement = document.getElementsByClassName("paginationNumber")[1];
    totalPagesNumberElement.textContent = "1";
}
function replaceNextPageWithNextArticle() {
    const nextPageAnchor = document.getElementsByClassName("next")[0];
    const parent = nextPageAnchor.parentElement;
    parent.removeChild(nextPageAnchor);
    parent.appendChild(goToNextArticleAnchor);

}

function areAllPagesLoaded() {
    for (let i = INDEX_OF_SECOND_PAGE; i <= numberOfPages; i++) {
        if (articleSectionsFromTheOtherPages[i] === undefined) {
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
    const allImageElements = section.getElementsByTagName("img");
    for (let i = 0; i < allImageElements.length; i++) {
        const imageElement = allImageElements[i];
        const imageUrl = imageElement.getAttribute("data-img");
        imageElement.removeAttribute("data-img");
        imageElement.src = imageUrl;
    }
}

function getArticleSectionElementFromDocument(htmlDocument) {
    const rightSide = htmlDocument.getElementById("safePlace");
    const article = htmlDocument.getElementsByTagName("article")[0];
    if (article !== null && article !== undefined) {
        const bodySection = article.getElementsByTagName("section")[0];
        return bodySection.getElementsByTagName("section")[0];
    }
}