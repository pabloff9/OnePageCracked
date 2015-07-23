var mainSection = getArticleSectionElementFromDocument(document);
var numberOfPages = 0;
var sectionsFromOtherPages = [];

if (mainSection != null && mainSection != undefined) {
    var numberOfPages = findNumberOfPages();
    console.log(numberOfPages);
    urlsOfFollowingPages = findUrlsOfFollowingPages(window.location.href, numberOfPages);

    for (url of urlsOfFollowingPages) {
        putContentOfPageInThisOne(url);
    }

}

function findNumberOfPages() {
    return Number(document.getElementsByClassName("paginationNumber")[1].innerHTML);
}

function areAllPagesLoaded() {
    for (var i = 2; i <= numberOfPages; i++) {
        if (sectionsFromOtherPages[i] === undefined) {
            return false;
        }
    }
    return true;
}

function putContentOfPageInThisOne(url) {

    var requestForPage = new XMLHttpRequest();
    requestForPage.open("GET", url, true);
    requestForPage.onload = function(e) {
        if (requestForPage.readyState === 4) {
            if (requestForPage.status === 200) {
                parser = new DOMParser();
                parsedDocument = parser.parseFromString(requestForPage.response, "text/html");
                articleSectionOfTheOtherPage = getArticleSectionElementFromDocument(parsedDocument);
                mainSection.innerHTML += articleSectionOfTheOtherPage.innerHTML;
            } else {
                console.error("Falha na requisiçao!");
                console.error(url);
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
    var regexp = /http:\/\/www.cracked.com\/(?:blog\/)?([^\/]*)(?:\/|\.html).*/;
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