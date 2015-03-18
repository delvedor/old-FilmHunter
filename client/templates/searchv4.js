/**
 * Variables Declaration
 */
var film,
    filmLen,
    filmCount,
    notfoundCount,
    image,
    pageCount;

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
        if (e.type == "keyup" && e.which == 13) {
            e.preventDefault();
            query = $('#filmSearch').val();
            if (query.replace(/\s/g, '') == "") {
                $('#filmSearch').val("");
                return;
            }
            Session.set('query', query);
            Session.set("searching", true);
            startSearch(query);
            Router.go('loading');
        }
    },
    'click #goSearch': function(e) {
        e.preventDefault();
        query = $('#filmSearch').val();
        if (query.replace(/\s/g, '') == "") {
            $('#filmSearch').val("");
            return;
        }
        Session.set('query', query);
        Session.set("searching", true);
        startSearch(query);
        Router.go('loading');
    }
});

/**
 * Search Template Events
 */
Template.search.events({
    'keyup #film': function(e) {
        if (e.type == "keyup" && e.which == 13) {
            e.preventDefault();
            query = $('#film').val();
            if (query.replace(/\s/g, '') == "") {
                $('#film').val("");
                Router.go('search');
                return;
            }
            Session.set('query', query);
            Session.set("searching", true);
            startSearch(query);
            Router.go('loading');
        }
    },

    'click #submitFilm': function(e) {
        e.preventDefault();
        query = $('#film').val();
        if (query.replace(/\s/g, '') == "") {
            $('#film').val("");
            Router.go('search', false);
            return;
        }
        Session.set('query', query);
        Session.set("searching", true);
        startSearch(query);
        Router.go('loading');
    }
});

Template.resultsKeyword.events({
    'click .keyword': function(e) {
        e.preventDefault();
        query = $(e.currentTarget).text();
        Session.set('query', query);
        Session.set("searching", true);
        startSearch(escape(query));
        Router.go('loading');
    }
});

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
    console.log('searchMovie', ris);
    Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    if (ris.total_results == 0) {
        allFinish(1, 1);
        return;
    }
    for (var i = 0; i < ris.results.length; i++) {
        image = (ris.results[i].poster_path != null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : 'image_not_found.jpg');
        image = image.replace(/\s/g, '');
        arrayResultFilm.push({
            title: ris.results[i].title,
            id: ris.results[i].id,
            popularity: ris.results[i].popularity,
            image_path: image,
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
    //console.log('saveResults', ris);
    Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    for (var i = 0; i < ris.results.length; i++) {
        image = (ris.results[i].poster_path != null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : 'image_not_found.jpg');
        image = image.replace(/\s/g, '');
        arrayResultFilmFromKeyword.push({
            keyword: ris.id,
            title: ris.results[i].title,
            id: ris.results[i].id,
            popularity: ris.results[i].popularity,
            image_path: image,
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
    if (notfoundCount == filmLen + 1) {
        Router.go('notfound');
        return;
    }

    if (filmCount == filmLen + 1) {
        arrayResultFilmFromKeyword.sort(function(a, b) {
            return b.popularity - a.popularity;
        });

        arrayResultFilmFromKeywordDef = arrayResultFilm.concat(arrayResultFilmFromKeyword);

        arrayResultFilmFromKeywordDef.sort(function(a, b) {
            return b.popularity - a.popularity;
        });

        for (var i = 0; i < arrayResultFilmFromKeywordDef.length - 1; i++) {
            if (arrayResultFilmFromKeywordDef[i].title == arrayResultFilmFromKeywordDef[i + 1].title) {
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

/*function allFinish(found, notfound) {
    notfoundCount += notfound;
    filmCount += found;
    if (notfoundCount == filmLen) {
        Router.go('notfound');
        return;
    }

    if (filmCount == filmLen) {
        arrayResultFilmFromKeyword.sort(function(a, b) {
            return b.popularity - a.popularity;
        });
        for (var i = 0; i < arrayResultFilmFromKeyword.length - 1; i++) {
            if (arrayResultFilmFromKeyword[i].title == arrayResultFilmFromKeyword[i + 1].title) {
                continue;
            } else {
                arrayResultFilmFromKeywordDef.push(arrayResultFilmFromKeyword[i]);
            }
        }
        arrayResultFilmFromKeywordDef.push(arrayResultFilmFromKeyword[arrayResultFilmFromKeyword.length - 1]);

        if (arrayResultFilmFromKeywordDef[0])
            arrayResultFilmFromKeywordDef[0].order = "col-xs-12 col-sm-12 col-md-12 first";
        if (arrayResultFilmFromKeywordDef[1])
            arrayResultFilmFromKeywordDef[1].order = "col-xs-12 col-sm-12 col-md-6 second";
        if (arrayResultFilmFromKeywordDef[2])
            arrayResultFilmFromKeywordDef[2].order = "col-xs-12 col-sm-12 col-md-6 third";
        arrayResultFilmFromKeywordDef = arrayResultFilmFromKeywordDef.slice(0, 99);

        Session.set('arrayResultFilm', arrayResultFilmFromKeywordDef);
        Session.set("searching", false);
        Router.go('search');
    }
}*/

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

/**
 * Color Generator
 */
Template.layout.rendered = function() {
    var random = Math.floor(Math.random() * 3) + 1;
    var background, border, color;
    if (random == 1) {
        background = "background-red";
        border = "border-red";
        color = "color-red";
    } else if (random == 2) {
        background = "background-blue";
        border = "border-blue";
        color = "color-blue";
    } else {
        background = "background-green";
        border = "border-green";
        color = "color-green";
    }
    $('.nav-bar').addClass(background);
    $('.header').addClass(background);
    $('.border-search').addClass(border);
    $('#submitFilm').addClass(color);

};