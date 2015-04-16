/**
 * Load film results
 */
Template.resultsFilm.helpers({
    resultsPageFilm: function() {
        if (!dbResults.findOne())
            return [];
        return dbResults.findOne({}, {
            sort: {
                ts: -1
            }
        }).results;
    },

    moreResults: function() {
        return Session.get("moreResults");
    },

    genrePage: function() {
        return Session.get("genrePage");
    }
});

Template.resultsFilm.events({
    'click #loadMore': function(e) {
        e.preventDefault();
        startSearchGenre(_.last(searchHistory), true);
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

Template.resultsFilm.rendered = function() {
    setGrid();
};
