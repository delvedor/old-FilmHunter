/**
 * Load film results
 */
Template.resultsFilm.helpers({
    resultsPageFilm: function() {
        Meteor.setTimeout(setHeight, 1000);
        if (!dbResults.findOne())
            return [];
        return dbResults.findOne({}, {
            sort: {
                ts: -1
            }
        }).results;
    }
});

/**
 * Return the number of he analized results.
 */
Template.loadingRes.helpers({
    totalResults: function() {
        return Session.get('numberOfResults');
    }
});

/**
 * Corrects the height of the div standard
 */
function setHeight() {
    var maxHeight = Math.max.apply(null, $(".standard").map(function() {
        return $(this).height();
    }).get());
    $(".standard").height(maxHeight);
}
