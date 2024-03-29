/**
 * Load film results
 */
Template.resultsFilm.helpers({
    resultsPageFilm: function() {
        Meteor.setTimeout(setGrid, 100);
        if (!dbResults.findOne())
            return [];
        return dbResults.findOne({}, {
            sort: {
                ts: -1
            }
        }).results;
    }
});

Template.resultsFilm.events({
    'click #loadMore': function(e) {
        e.preventDefault();
        startSearchGenre(_.last(searchHistory), true);
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
