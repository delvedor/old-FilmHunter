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
    var d = new Date();
    var date = parseInt(d.getFullYear() + '' + ((d.getMonth() + '').length === 1 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '' + ((d.getDate() + '').length === 1 ? '0' + d.getDate() : d.getDate()), 10);
    var release_date;
    _.each(arr, function(ele) {
        release_date = parseInt((ele.release_date !== null ? ele.release_date : '0').replace(/[-]/g, ''), 10);
        if (date < release_date)
            return;
        if (ele.job === "Director" || ele.character) {
            arrayResultFilm.push({
                title: ele.title,
                id: ele.id,
                image_path: (ele.poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ele.poster_path : '/blank.jpg'),
                rdOrder: release_date,
                order: (release_date % 2 === 0 ? 'bigBox' : 'smallBox')
            });
        }
    });
    arrayResultFilm = _.sortBy(arrayResultFilm, function(ele) {
        return -ele.rdOrder;
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
    Session.set("moreResults", false);
}
