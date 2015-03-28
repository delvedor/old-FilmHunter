/**
 * Variables Declaration
 */
var film;
var search = "";
var filmLen;
var finishSearch;
var keywordCount;
var notfoundCount;
var image;
var releaseDate;
var pageCount;

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
    Meteor.call('searchMovies', escape(searchKey), pageCount, function(err, result) {
        if (result)
            saveMovies(result.content);
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
function saveMovies(data) {
    pageCount++;
    var ris = $.parseJSON(data);
    if (ris.total_results === 0) {
        allFinish(1, 1);
        return;
    }
    Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    for (var i = 0, risLen = ris.results.length; i < risLen; ++i) {
        image = (ris.results[i].poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : 'http://rocketdock.com/images/screenshots/Blank.png');
        image = image.replace(/\s/g, '');
        arrayResultFilm.push({
            title: ris.results[i].title,
            id: ris.results[i].id,
            popularity: ris.results[i].popularity,
            image_path: image,
            release_date: ris.results[i].release_date,
            order: "col-xs-6 col-sm-4 col-md-4 standard"
        });
    }

    if (ris.total_pages > pageCount && pageCount < 15) {
        Meteor.call('searchMovies', search, pageCount, function(err, result) {
            if (result)
                saveMovies(result.content);
            if (err)
                console.log(err);
        });
    } else {
        arrayResultFilm.sort(function(a, b) {
            return b.popularity - a.popularity;
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
    keywordCount++;
    Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    for (var i = 0, risLen = ris.results.length; i < risLen; ++i) {
        image = (ris.results[i].poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : 'http://rocketdock.com/images/screenshots/Blank.png');
        image = image.replace(/\s/g, '');
        arrayResultKeyword.push({
            keyword: ris.id,
            title: ris.results[i].title,
            id: ris.results[i].id,
            popularity: ris.results[i].popularity,
            image_path: image,
            release_date: ris.results[i].release_date,
            order: "col-xs-6 col-sm-4 col-md-4 standard"
        });
    }
    if (keywordCount === filmLen) {
        arrayResultKeyword.sort(function(a, b) {
            return b.popularity - a.popularity;
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
            return b.popularity - a.popularity;
        });

        for (var i = 0, arrLen = arrayResultFilm.length; i < arrLen - 1; ++i) {
            if (arrayResultFilm[i].title === arrayResultFilm[i + 1].title && arrayResultFilm[i].release_date === arrayResultFilm[i + 1].release_date) {
                arrayResultFilm[i + 1].popularity = arrayResultFilm[i + 1].popularity * 2;
                continue;
            } else {
                arrSwap.push(arrayResultFilm[i]);
            }
        }
        arrSwap.push(arrayResultFilm[arrayResultFilm.length - 1]);

        arrayResultFilm = arrSwap;
        if (arrayResultFilm[0])
            arrayResultFilm[0].order = "col-xs-12 col-sm-12 col-md-12 first";
        if (arrayResultFilm[1])
            arrayResultFilm[1].order = "col-xs-12 col-sm-12 col-md-6 second";
        if (arrayResultFilm[2])
            arrayResultFilm[2].order = "col-xs-12 col-sm-12 col-md-6 third";
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
    keywordCount = 0;
    notfoundCount = 0;
    pageCount = 1;
    arrayResultFilm = [];
    arrayResultGenre = [];
    arrayResultKeyword = [];
    Session.set('numberOfResults', 0);
}
