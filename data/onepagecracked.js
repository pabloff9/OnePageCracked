var mainSection = getArticleSectionElementFromDocument(document);
var numberOfPages = 0;
var articleSectionsFromTheOtherPages = [];
const INDEX_OF_SECOND_PAGE = 2;

if (mainSection != null && mainSection != undefined) {
    numberOfPages = findNumberOfPages();
    console.log(numberOfPages);
    urlsOfFollowingPages = findUrlsOfFollowingPages(window.location.href, numberOfPages);

    for (var i = INDEX_OF_SECOND_PAGE; i <=numberOfPages; i++) {
        putContentOfPageInThisOne(urlsOfFollowingPages[i-INDEX_OF_SECOND_PAGE], i);
    }

}

function findNumberOfPages() {
    return Number(document.getElementsByClassName("paginationNumber")[1].innerHTML);
}

function areAllPagesLoaded() {
    for (var i = INDEX_OF_SECOND_PAGE; i <= numberOfPages; i++) {
        if (articleSectionsFromTheOtherPages[i] === undefined) {
            return false;
        }
    }
    return true;
}

function loadAllImagesFromTheNewArticleSession() {
    var allImageElements = mainSection.getElementsByTagName("img");
    for (var i = 0; i < allImageElements.length; i++) {
        var imageElement = allImageElements[i];
        //imageElement.setAttribute("src", imageElement.getAttribute("src") + "?123");
        imageElement.src = imageElement.src + "?123";
        imageElement.setAttribute("data-img", imageElement.getAttribute("data-img") + "?123");
    }
}

function appendContentToThisPage() {
    for (var i = INDEX_OF_SECOND_PAGE; i <= numberOfPages; i++) {
        //mainSection.innerHTML += articleSectionsFromTheOtherPages[i].innerHTML;
        mainSection.parentNode.appendChild(articleSectionsFromTheOtherPages[i]);
    }
    loadAllImagesFromTheNewArticleSession();
}

function putContentOfPageInThisOne(url, pageNumber) {

    var requestForPage = new XMLHttpRequest();
    requestForPage.open("GET", url, true);
    requestForPage.onload = function(e) {
        if (requestForPage.readyState === 4) {
            if (requestForPage.status === 200) {
                parser = new DOMParser();
                parsedDocument = parser.parseFromString(requestForPage.response, "text/html");
                articleSectionsFromTheOtherPages[pageNumber] = getArticleSectionElementFromDocument(parsedDocument);

                if (areAllPagesLoaded()) {
                    appendContentToThisPage();
                }

            } else {
                console.error("Falha na requisiçao!");
                console.error(url);
                console.error(pageNumber);
                console.error(requestForPage.status);
            }
        }
    };

    requestForPage.onerror = function (e) {
        console.error(requestForPage.statusText);
    };

    requestForPage.send(null);

}


function findUrlsOfFollowingPages(urlOfFirstPage, numberOfPages) {
    var titlePortionOfFirstPage = findTitlePortionOfTheUrl(urlOfFirstPage);
    var urlsOfAllPages = [];
    for (var i = 2; i <= numberOfPages; i++) {
        var titlePortionOfThisPage = titlePortionOfFirstPage + "_p" + i;
        var urlOfNextPage = urlOfFirstPage.replace(titlePortionOfFirstPage, titlePortionOfThisPage);
        urlsOfAllPages.push(urlOfNextPage);
    }
    return urlsOfAllPages;
}

function findTitlePortionOfTheUrl(urlOfFirstPage) {
    var regexp = /http:\/\/www.cracked.com\/(?:(?:blog|article)\/)?([^\/]*)(?:\/|\.html).*/;
    var info = regexp.exec(urlOfFirstPage);
    return info[1];
}

function getArticleSectionElementFromDocument(htmlDocument) {
    var rightSide = htmlDocument.getElementById("safePlace");
    var article = htmlDocument.getElementsByTagName("article")[0];
    if (article !== null && article !== undefined) {
        var bodySection = article.getElementsByTagName("section")[0];
        return bodySection.getElementsByTagName("section")[0];
    }
}