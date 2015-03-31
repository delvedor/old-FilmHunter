/**
 * Variables Declaration
 */
var film;
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
    var date = d.getFullYear() + '' + ((d.getMonth() + '').length === 1 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '' + ((d.getDate() + '').length === 1 ? '0' + d.getDate() : d.getDate());
    var order;
    var release_date;
    Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    for (var i = 0, risLen = ris.results.length; i < risLen; ++i) {
        release_date = parseInt(ris.results[i].release_date.replace(/[-]/g, ''), 10);
        if (parseInt(date, 10) < release_date)
            continue;
        image = (ris.results[i].poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : '/blank.jpg');
        image = image.replace(/\s/g, '');
        order = (release_date % 2 === 0 ? 'big' : 'small');
        arrayResultFilm.push({
            title: ris.results[i].title,
            id: ris.results[i].id,
            vote: parseFloat(ris.results[i].vote_average) * parseInt(ris.results[i].vote_count, 10),
            image_path: image,
            release_date: ris.results[i].release_date,
            order: order
        });
    }

    if (ris.total_pages > pageCount && pageCount < 15) {
        Meteor.call('searchMovies', search, pageCount, function(err, result) {
            if (result)
                saveMovies(result.content, ++pageCount);
            if (err)
                console.log(err);
        });
    } else {
        arrayResultFilm.sort(function(a, b) {
            return b.vote - a.vote;
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
    var date = d.getFullYear() + '' + d.getMonth() + 1 + '' + d.getDate();
    var order;
    var release_date;
    Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    for (var i = 0, risLen = ris.results.length; i < risLen; ++i) {
        release_date = parseInt(ris.results[i].release_date.replace(/[-]/g, ''), 10);
        if (parseInt(date, 10) < release_date)
            continue;
        image = (ris.results[i].poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : '/blank.jpg');
        image = image.replace(/\s/g, '');
        order = (release_date % 2 === 0 ? 'big' : 'small');
        arrayResultKeyword.push({
            keyword: ris.id,
            title: ris.results[i].title,
            id: ris.results[i].id,
            vote: parseFloat(ris.results[i].vote_average) * parseInt(ris.results[i].vote_count, 10),
            image_path: image,
            release_date: ris.results[i].release_date,
            order: order
        });
    }
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
        arrayResultFilm.push.apply(arrayResultFilm, arrayResultKeyword);
        arrayResultFilm.sort(function(a, b) {
            return b.vote - a.vote;
        });
        for (var i = 0, arrLen = arrayResultFilm.length; i < arrLen - 1; ++i) {
            if (arrayResultFilm[i].title === arrayResultFilm[i + 1].title && arrayResultFilm[i].release_date === arrayResultFilm[i + 1].release_date)
                continue;
            else
                arrSwap.push(arrayResultFilm[i]);
        }
        arrSwap.push(arrayResultFilm[arrayResultFilm.length - 1]);

        arrayResultFilm = arrSwap;
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
