/**
 * Variables Declaration
 */
var search = "";
var arrayResultGenre = [];


startSearchGenre = function(searchKey) {
    resetVariables();
    search = searchKey.replace(/[^a-zA-Z0-9_:]/g, '-');
    var id = genres.find({
        check: searchKey.replace(/\s/g, '').toLowerCase().substring(2)
    }).fetch();
    if (id.length === 0) {
        Router.go('notfound');
        return;
    }
    Meteor.call('searchGenreMovies', id[0].id, 1, function(err, result) {
        if (result)
            saveGenre(result.content, 2);
        if (err)
            console.log(err);
    });
};

/**
 * Saves and finalizes the results of the genre search.
 */
saveGenre = function(data, page) {
    var ris = $.parseJSON(data);
    if (page === 2) {
        resetVariables();
        Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    }
    if (page > 6) {
        dbResults.insert({
            search: search,
            results: arrayResultGenre,
            ts: new Date()
        });
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
            order: (release_date % 2 === 0 ? 'big' : 'small')
        });
    });
    Meteor.call('searchGenreMovies', ris.id, page, function(err, result) {
        if (result)
            saveGenre(result.content, ++page);
        if (err)
            console.log(err);
    });

};

/**
 * Reset all the variables for a new search.
 */
function resetVariables() {
    arrayResultGenre = [];
    Session.set('numberOfResults', 0);
}
