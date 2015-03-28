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
        if (arrayResultGenre[0])
            arrayResultGenre[0].order = "col-xs-12 col-sm-12 col-md-12 first";
        if (arrayResultGenre[1])
            arrayResultGenre[1].order = "col-xs-12 col-sm-12 col-md-6 second";
        if (arrayResultGenre[2])
            arrayResultGenre[2].order = "col-xs-12 col-sm-12 col-md-6 third";
        dbResults.insert({
            search: search,
            results: arrayResultGenre,
            ts: new Date()
        });
        Session.set("searching", false);
        return;
    }

    for (var i = 0, risLen = ris.results.length; i < risLen; ++i) {
        image = (ris.results[i].poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : 'http://rocketdock.com/images/screenshots/Blank.png');
        image = image.replace(/\s/g, '');
        arrayResultGenre.push({
            genreId: ris.id,
            title: ris.results[i].title,
            id: ris.results[i].id,
            image_path: image,
            release_date: ris.results[i].release_date,
            order: "col-xs-6 col-sm-4 col-md-4 standard"
        });
    }

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
