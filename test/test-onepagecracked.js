/**
 * Created by pablo on 21/07/15.
 */
var onepagecracked = require("../data/onepagecracked.js");

exports["test main"] = function(assert) {
    assert.pass("Unit test running!");
};

exports["test main async"] = function(assert, done) {
    assert.pass("async Unit test running!");
    done();
};

exports["test findTitlePortionOfTheUrl"] = function(assert) {

    var blogUrl = "http://www.cracked.com/blog/5-things-i-learned-about-addiction-after-5-years-sober/";
    for (key in onepagecracked) {
        console.log(key + " -> " + onepagecracked[key]);
    }
    var titlePortion = onepagecracked.findTitlePortionOfTheUrl(blogUrl);

    assert.ok((titlePortion === "5-things-i-learned-about-addiction-after-5-years-sober"), "Passou 1");

};

require("sdk/test").run(exports);
