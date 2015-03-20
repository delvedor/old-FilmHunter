/**
 * Variables Declaration
 */
var film;
var filmLen;
var filmCount;
var notfoundCount;
var image;
var pageCount;

var arrayResultFilm = [];
var arrayResultFilmFromKeyword = [];
var arrayResultKeyword = [];
var arrayResultFilmFromKeywordDef = [];
var arrayResultFilmDef = [];

/**
 * Home Template Events
 */
Template.home.events({
    'keyup #filmSearch': function(e) {
        if (e.type === "keyup" && e.which === 13) {
            e.preventDefault();
            query = $('#filmSearch').val();
            if (query.replace(/\s/g, '') === "") {
                $('#filmSearch').val("");
                return;
            }
            clickEvent(query)
        }
    },
    'click #goSearch': function(e) {
        e.preventDefault();
        query = $('#filmSearch').val();
        if (query.replace(/\s/g, '') === "") {
            $('#filmSearch').val("");
            return;
        }
        clickEvent(query)
    }
});

/**
 * Search Template Events
 */
Template.search.events({
    'keyup #film': function(e) {
        if (e.type === "keyup" && e.which === 13) {
            e.preventDefault();
            query = $('#film').val();
            if (query.replace(/\s/g, '') === "") {
                $('#film').val("");
                Router.go('search');
                return;
            }
            clickEvent(query)
        }
    },

    'click #submitFilm': function(e) {
        e.preventDefault();
        query = $('#film').val();
        if (query.replace(/\s/g, '') === "") {
            $('#film').val("");
            Router.go('search', false);
            return;
        }
        clickEvent(query)
    }
});

Template.resultsKeyword.events({
    'click .keyword': function(e) {
        e.preventDefault();
        query = $(e.currentTarget).text();
        clickEvent(query)
    }
});

function clickEvent(query) {
    Session.set('query', query);
    Session.set("searching", true);
    startSearch(query);
    Router.go('loading');
}

/**
 * Starts the search based on the keyword.
 */
function startSearch(filmSearch) {
    resetVariables();
    film = filmSearch.split(" ");
    filmLen = film.length;
    for (var i = 0; i < film.length; i++) {
        Meteor.call('searchKeywords', film[i], function(err, result) {
            if (result) {
                //console.log(result.content);
                searchMoviesFromKeyword(result.content);
            }
            if (err) {
                console.log(err);
            }
        });
    }

    Meteor.call('searchMovies', filmSearch, pageCount, function(err, result) {
        if (result) {
            //console.log(result.content);
            saveMovies(result.content, filmSearch);
        }
        if (err) {
            console.log(err);
        }
    });

}

/**
 * Get the results of the search from keword.
 */
function searchMoviesFromKeyword(data) {
    var ris = $.parseJSON(data);
    //console.log('searchMovie', ris);
    //Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    if (ris.total_results !== 0) {
        for (var i = 0; i < ris.results.length; i++) {
            arrayResultKeyword.push({
                id: ris.results[i].id,
                name: ris.results[i].name
            });
        }
        Session.set('arrayResultKeyword', arrayResultKeyword);
        Meteor.call('searchMoviesFromKeyword', ris.results[0].id, function(err, result) {
            if (result) {
                //console.log(result.content);
                saveResults(result.content);
            }
            if (err) {
                console.log(err);
            }
        });
    } else {
        allFinish(1, 1);
    }
}

/**
 * Get the results of the search from moviesearch.
 */
function saveMovies(data, filmSearch) {
    pageCount++;
    var ris = $.parseJSON(data);
    var risLen = ris.results.length;
    console.log('searchMovie', ris);
    Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    if (ris.total_results === 0) {
        allFinish(1, 1);
        return;
    }
    for (var i = 0; i < risLen; i++) {
        image = (ris.results[i].poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : 'image_not_found.jpg');
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

    if (ris.total_pages > pageCount && pageCount < 21) {
        Meteor.call('searchMovies', filmSearch, pageCount, function(err, result) {
            if (result) {
                saveMovies(result.content, filmSearch);
            }
            if (err) {
                console.log(err);
            }
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
 * Save the results of the search.
 */
function saveResults(data) {
    var ris = $.parseJSON(data);
    var risLen = ris.results.length;
    Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    for (var i = 0; i < risLen; i++) {
        image = (ris.results[i].poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : 'image_not_found.jpg');
        image = image.replace(/\s/g, '');
        arrayResultFilmFromKeyword.push({
            keyword: ris.id,
            title: ris.results[i].title,
            id: ris.results[i].id,
            popularity: ris.results[i].popularity,
            image_path: image,
            release_date: ris.results[i].release_date,
            order: "col-xs-6 col-sm-4 col-md-4 standard"
        });
    }
    allFinish(1, 0);
}

/**
 * Finalizes the results of the search.
 */
function allFinish(found, notfound) {
    notfoundCount += notfound;
    filmCount += found;
    if (notfoundCount === filmLen + 1) {
        Router.go('notfound');
        return;
    }

    if (filmCount === filmLen + 1) {
        arrayResultFilmFromKeyword.sort(function(a, b) {
            return b.popularity - a.popularity;
        });

        arrayResultFilmFromKeywordDef = arrayResultFilm.concat(arrayResultFilmFromKeyword);

        arrayResultFilmFromKeywordDef.sort(function(a, b) {
            return b.popularity - a.popularity;
        });

        var arrLen = arrayResultFilmFromKeywordDef.length;
        for (var i = 0; i < arrLen - 1; i++) {
            if (arrayResultFilmFromKeywordDef[i].title === arrayResultFilmFromKeywordDef[i + 1].title && arrayResultFilmFromKeywordDef[i].release_date === arrayResultFilmFromKeywordDef[i + 1].release_date) {
                arrayResultFilmFromKeywordDef[i + 1].popularity = arrayResultFilmFromKeywordDef[i + 1].popularity * 2;
                continue;
            } else {
                arrayResultFilmDef.push(arrayResultFilmFromKeywordDef[i]);
            }
        }
        arrayResultFilmDef.push(arrayResultFilmFromKeywordDef[arrayResultFilmFromKeywordDef.length - 1]);

        if (arrayResultFilmDef[0])
            arrayResultFilmDef[0].order = "col-xs-12 col-sm-12 col-md-12 first";
        if (arrayResultFilmDef[1])
            arrayResultFilmDef[1].order = "col-xs-12 col-sm-12 col-md-6 second";
        if (arrayResultFilmDef[2])
            arrayResultFilmDef[2].order = "col-xs-12 col-sm-12 col-md-6 third";
        arrayResultFilmDef = arrayResultFilmDef.slice(0, 99);

        Session.set('arrayResultFilm', arrayResultFilmDef);
        Session.set("searching", false);
        Router.go('search');
    }
}

/**
 * Reset all the variables for a new search.
 */
function resetVariables() {
    filmCount = 0;
    notfoundCount = 0;
    pageCount = 1;
    arrayResultFilm = [];
    arrayResultFilmFromKeyword = [];
    arrayResultKeyword = [];
    arrayResultFilmFromKeywordDef = [];
    arrayResultFilmDef = [];
    Session.set('arrayResultFilm', []);
    Session.set('arrayResultKeyword', []);
    Session.set('numberOfResults', 0);
}

/**
 * Api Error callback
 */
function errorCB(data) {
    console.log("Error callback: " + data);
}

/**
 * Write the query into the input field
 */
Template.search.helpers({
    query: function() {
        return Session.get('query');
    }
});