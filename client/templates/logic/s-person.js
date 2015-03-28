/**
 * Variables Declaration
 */
var search = "";
var escapedSearch = "";
var arrayResultFilm = [];

startSearchPerson = function(searchKey) {
    resetVariables();
    search = searchKey.replace(/[^a-zA-Z0-9_:]/g, '-');
    escapedSearch = escape(searchKey.substring(2).trim());
    Meteor.call('searchPerson', escapedSearch, function(err, result) {
        if (result) {
            var ris = $.parseJSON(result.content);
            if (ris.results.length === 0) {
                Router.go('notfound');
                return;
            }
            Meteor.call('searchPersonMovie', ris.results[0].id, function(err, result2) {
                if (result2)
                    savePerson(result2.content, search.substring(0, 2));
                if (err)
                    console.log(err);
            });
        }
        if (err)
            console.log(err);
    });
};

/**
 * Saves and finalizes the results of the person search.
 */
function savePerson(data, typeSearch) {
    var ris = $.parseJSON(data);
    var arr = [];
    if (ris.cast.length + ris.crew.length === 0) {
        Router.go('notfound');
        return;
    }
    if (typeSearch === "a:")
        arr = ris.cast;
    if (typeSearch === "d:")
        arr = ris.crew;
    var risLen = arr.length;
    Session.set('numberOfResults', risLen);
    for (var i = 0; i < risLen; ++i) {
        if (arr[i].job === "Director" || arr[i].character) {
            image = (arr[i].poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + arr[i].poster_path : 'http://rocketdock.com/images/screenshots/Blank.png');
            image = image.replace(/\s/g, '');
            releaseDate = (arr[i].release_date !== null ? arr[i].release_date : '0');
            arrayResultFilm.push({
                title: arr[i].title,
                id: arr[i].id,
                image_path: image,
                release_date: releaseDate,
                rdOrder: parseInt(releaseDate.replace(/[^0-9_]/g, ''), 10),
                order: "col-xs-6 col-sm-4 col-md-4 standard"
            });
        }
    }
    arrayResultFilm.sort(function(a, b) {
        return b.rdOrder - a.rdOrder;
    });
    dbResults.insert({
        search: search,
        results: arrayResultFilm,
        ts: new Date()
    });
    Session.set("searching", false);
}

/**
 * Reset all the variables for a new search.
 */
function resetVariables() {
    search = "";
    escapedSearch = "";
    arrayResultFilm = [];
    Session.set('numberOfResults', 0);
}
