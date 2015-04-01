/**
 * Load film results
 */
Template.resultsFilm.helpers({
    resultsPageFilm: function() {
        Meteor.setTimeout(setGrid, 300);
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
function setGrid() {
    var container = document.querySelector('.resultsGrid');
    var iso = new Isotope(container, {
        itemSelector: '.colElement-results',
        masonry: {
            isFitWidth: true
        }
    });

}
