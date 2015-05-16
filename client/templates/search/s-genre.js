/**
 * Variables Declaration
 */
var search = "";
var totalPages = 0;
var arrayResultGenre = [];
var moreResults = new Blaze.ReactiveVar(false);


startSearchGenre = function(searchKey, loadMore) {
    Session.set('genrePage', true);
    resetVariables();
    var page;
    search = searchKey.replace(/[^a-zA-Z0-9_:]/g, '-');
    var id = genres.find({
        check: searchKey.replace(/[-]/g, '').replace(/\s/g, '').toLowerCase().substring(2)
    }).fetch();
    if (id.length === 0) {
        console.log(id);
        Router.go('notfound');
        return;
    }
    if (loadMore) {
        page = dbResults.findOne({}, {
            sort: {
                ts: -1
            }
        }).page;
    } else {
        page = 1;
    }
    Meteor.call('searchGenreMovies', id[0].id, page, function(err, result) {
        if (result)
            saveGenre(result.content, ++page, 2);
        if (err)
            console.log(err);
    });
};

/**
 * Saves and finalizes the results of the genre search.
 */
function saveGenre(data, page, count) {
    var ris = $.parseJSON(data);
    if (page === 2) {
        resetVariables();
        totalPages = ris.total_pages;
    }
    if (count === 5) {
        var results = dbResults.findOne({}, {
            sort: {
                ts: -1
            }
        });
        if (results === undefined || results.search !== search) {
            dbResults.insert({
                search: search,
                results: arrayResultGenre,
                ts: new Date(),
                page: page,
                totalPages: totalPages
            });
        } else {
            dbResults.update({
                search: search
            }, {
                $unset: {
                    results: [],
                    ts: '',
                    page: ''
                },
                $set: {
                    results: _.union(results.results, arrayResultGenre),
                    ts: new Date(),
                    page: page
                }
            });
        }

        if (page < totalPages)
            moreResults.set(true);
        else
            moreResults.set(false);
        Session.set('genrePage', false);
        Session.set("searching", false);
        return;
    }
    var d = new Date();
    var date = parseInt(d.getFullYear() + '' + ((d.getMonth() + '').length === 1 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '' + ((d.getDate() + '').length === 1 ? '0' + d.getDate() : d.getDate()), 10);
    var release_date;
    _.each(ris.results, function(ele) {
        release_date = parseInt(ele.release_date.replace(/[-]/g, ''), 10);
        if (date < release_date)
            return;
        arrayResultGenre.push({
            title: ele.title,
            id: ele.id,
            image_path: (ele.poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ele.poster_path : '/blank.jpg'),
            order: (release_date % 2 === 0 ? 'bigBox' : 'smallBox')
        });
    });
    Meteor.call('searchGenreMovies', ris.id, page, function(err, result) {
        if (result)
            saveGenre(result.content, ++page, ++count);
        if (err)
            console.log(err);
    });

}

/**
 * Reset all the variables for a new search.
 */
function resetVariables() {
    arrayResultGenre = [];
    moreResults.set(false);
}

Template.resultsFilm.helpers({
    moreResults: function() {
        return moreResults.get();
    },
    genrePage: function() {
        return Session.get("genrePage");
    }
});
