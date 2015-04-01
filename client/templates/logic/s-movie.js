/**
 * Variables Declaration
 */
var film = [];
var search = "";
var filmLen;
var finishSearch;
var notfoundCount;
var image;
var releaseDate;

var arrayResultFilm = [];
var arrayResultKeyword = [];

startSearchMovie = function(searchKey) {
    resetVariables();
    search = searchKey.replace(/[^a-zA-Z0-9_:]/g, '-');
    film = searchKey.split(" ");
    filmLen = film.length;
    for (var i = 0; i < filmLen; ++i) {
        Meteor.call('searchKeywords', film[i], function(err, result) {
            if (result)
                searchMoviesFromKeyword(result.content);
            if (err)
                console.log(err);
        });
    }
    Meteor.call('searchMovies', escape(searchKey), 1, function(err, result) {
        if (result)
            saveMovies(result.content, 2);
        if (err)
            console.log(err);
    });

};

/**
 * Get the results of the search from keword.
 */
function searchMoviesFromKeyword(data) {
    var ris = $.parseJSON(data);
    Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    if (ris.total_results === 0) {
        allFinish(1, 1);
        return;
    }
    Meteor.call('searchMoviesFromKeyword', ris.results[0].id, function(err, result) {
        if (result)
            saveKeywords(result.content);
        if (err)
            console.log(err);
    });
}

/**
 * Get the results of the search from moviesearch.
 */
function saveMovies(data, pageCount) {
    var ris = $.parseJSON(data);
    if (ris.total_results === 0) {
        allFinish(1, 1);
        return;
    }
    var d = new Date();
    var date = parseInt(d.getFullYear() + '' + ((d.getMonth() + '').length === 1 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '' + ((d.getDate() + '').length === 1 ? '0' + d.getDate() : d.getDate()), 10);
    var release_date;
    Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    _.each(ris.results, function(ele) {
        release_date = parseInt(ele.release_date.replace(/[-]/g, ''), 10);
        if (date < release_date)
            return;
        arrayResultFilm.push({
            title: ele.title,
            id: ele.id,
            release_date: ele.release_date,
            vote: parseFloat(ele.vote_average) * parseInt(ele.vote_count, 10),
            image_path: (ele.poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ele.poster_path : '/blank.jpg'),
            order: (release_date % 2 === 0 ? 'big' : 'small')
        });
    });

    if (ris.total_pages > pageCount && pageCount < 15) {
        Meteor.call('searchMovies', search, pageCount, function(err, result) {
            if (result)
                saveMovies(result.content, ++pageCount);
            if (err)
                console.log(err);
        });
    } else {
        arrayResultFilm = _.sortBy(arrayResultFilm, function(ele) {
            return -ele.vote;
        });
        arrayResultFilm = arrayResultFilm.slice(0, 99);
        allFinish(1, 0);
    }

}

/**
 * Save the results of the keyword search.
 */
function saveKeywords(data) {
    var ris = $.parseJSON(data);
    var d = new Date();
    var date = parseInt(d.getFullYear() + '' + ((d.getMonth() + '').length === 1 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '' + ((d.getDate() + '').length === 1 ? '0' + d.getDate() : d.getDate()), 10);
    var release_date;
    Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    _.each(ris.results, function(ele) {
        release_date = parseInt(ele.release_date.replace(/[-]/g, ''), 10);
        if (date < release_date)
            return;
        arrayResultKeyword.push({
            title: ele.title,
            id: ele.id,
            release_date: ele.release_date,
            vote: parseFloat(ele.vote_average) * parseInt(ele.vote_count, 10),
            image_path: (ele.poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ele.poster_path : '/blank.jpg'),
            order: (release_date % 2 === 0 ? 'big' : 'small')
        });
    });
    allFinish(1, 0);

}

/**
 * Finalizes the results of the search.
 */
function allFinish(finish, notfound) {
    notfoundCount += notfound;
    finishSearch += finish;
    var arrSwap = [];
    if (notfoundCount === filmLen + 1) {
        Router.go('notfound');
        return;
    }

    if (finishSearch === filmLen + 1) {
        arrayResultFilm = _.uniq(_.union(arrayResultFilm, arrayResultKeyword), false, function(ele) {
            return ele.title + ele.release_date;
        });

        arrayResultFilm = _.sortBy(arrayResultFilm, function(ele) {
            return -ele.vote;
        });

        arrayResultFilm = arrayResultFilm.slice(0, 199);

        dbResults.insert({
            search: search,
            results: arrayResultFilm,
            ts: new Date()
        });
        Session.set("searching", false);
    }
}

/**
 * Reset all the variables for a new search.
 */
function resetVariables() {
    finishSearch = 0;
    notfoundCount = 0;
    arrayResultFilm = [];
    arrayResultGenre = [];
    arrayResultKeyword = [];
    Session.set('numberOfResults', 0);
}
