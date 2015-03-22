/**
 * Variables Declaration
 */
var film;
var search;
var filmLen;
var finishSearch;
var keywordCount;
var notfoundCount;
var image;
var pageCount;

var arrayResultFilm = [];
var arrayResultFilmFromKeyword = [];
var arrayResultKeyword = [];
var arrayFullResults = [];
var arrayFullResultsDef = [];

Router.route('/search', {
    path: '/search/:key',
    layout: 'resultsFilm',
    layoutTemplate: 'layout',
    onBeforeAction: function() {
        this.render('loading');
        checkHistory(escape(this.params.key));
        if (!Session.get('searching'))
            this.next();
    },
    action: function() {
        if (pageHistory[pageHistory.length - 1] !== '/search/' + escape(this.params.key))
            pageHistory.push('/search/' + escape(this.params.key));
        this.render('resultsFilm');
    }
});

function checkHistory(params) {
    for (var i = 0; i < searchHistory.length; i++) {
        if (params === searchHistory[i]) {
            loadHistory(params);
            return;
        }
    }
    clickEvent(unescape(params));
}

function loadHistory(params) {
    dbResults.update({
        search: params
    }, {
        $unset: {
            ts: ""
        },
        $set: {
            ts: new Date()
        }
    });
}

/**
 * Home Template Events
 */
Template.home.events({
    'keyup #filmSearch': function(e) {
        if (e.type === "keyup" && e.which === 13) {
            e.preventDefault();
            query = $('#filmSearch').val().trim();
            if (query.replace(/\s/g, '') === "") {
                $('#filmSearch').val("");
                return;
            }
            //clickEvent(query);
            Router.go('/search/' + escape(query));
        }
    },
    'click #goSearch': function(e) {
        e.preventDefault();
        query = $('#filmSearch').val().trim();
        if (query.replace(/\s/g, '') === "") {
            $('#filmSearch').val("");
            return;
        }
        //clickEvent(query);
        Router.go('/search/' + escape(query));
    }
});

/**
 * Search Template Events
 */
Template.search.events({
    'keyup #film': function(e) {
        if (e.type === "keyup" && e.which === 13) {
            e.preventDefault();
            query = $('#film').val().trim();
            if (query.replace(/\s/g, '') === "") {
                $('#film').val("");
                Router.go('/search/' + escape(query));
                return;
            }
            //clickEvent(query);
            Router.go('/search/' + escape(query));
        }
    },

    'click #submitFilm': function(e) {
        e.preventDefault();
        query = $('#film').val().trim();
        if (query.replace(/\s/g, '') === "") {
            $('#film').val("");
            Router.go('/search/' + escape(query));
            return;
        }
        //clickEvent(query);
        Router.go('/search/' + escape(query));
    }
});

function clickEvent(query) {
    searchHistory.push(escape(query));
    Session.set('query', query);
    Session.set("searching", true);
    startSearch(query);
    //Router.go('loading');
}

/**
 * Starts the search based on the keyword.
 */
function startSearch(filmSearch) {
    resetVariables();
    search = escape(filmSearch);
    film = filmSearch.split(" ");
    filmLen = film.length;
    for (var i = 0; i < film.length; i++) {
        Meteor.call('searchKeywords', film[i], function(err, result) {
            if (result)
                searchMoviesFromKeyword(result.content);
            if (err)
                console.log(err);
        });
    }

    Meteor.call('searchMovies', search, pageCount, function(err, result) {
        if (result)
            saveMovies(result.content);
        if (err)
            console.log(err);
    });

}

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
    var risLen = ris.results.length;
    Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    for (var i = 0; i < risLen; i++) {
        image = (ris.results[i].poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : 'http://www.51allout.co.uk/wp-content/uploads/2012/02/Image-not-found-300x300.gif');
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
    var risLen = ris.results.length;
    keywordCount++;
    Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    for (var i = 0; i < risLen; i++) {
        image = (ris.results[i].poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : 'http://www.51allout.co.uk/wp-content/uploads/2012/02/Image-not-found-300x300.gif');
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
    if (keywordCount === filmLen) {
        arrayResultFilmFromKeyword.sort(function(a, b) {
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
    if (notfoundCount === filmLen + 1) {
        Router.go('notfound');
        return;
    }

    if (finishSearch === filmLen + 1) {
        arrayFullResults = arrayResultFilm.concat(arrayResultFilmFromKeyword);

        arrayFullResults.sort(function(a, b) {
            return b.popularity - a.popularity;
        });

        var arrLen = arrayFullResults.length;
        for (var i = 0; i < arrLen - 1; i++) {
            if (arrayFullResults[i].title === arrayFullResults[i + 1].title && arrayFullResults[i].release_date === arrayFullResults[i + 1].release_date) {
                arrayFullResults[i + 1].popularity = arrayFullResults[i + 1].popularity * 2;
                continue;
            } else {
                arrayFullResultsDef.push(arrayFullResults[i]);
            }
        }
        arrayFullResultsDef.push(arrayFullResults[arrayFullResults.length - 1]);

        if (arrayFullResultsDef[0])
            arrayFullResultsDef[0].order = "col-xs-12 col-sm-12 col-md-12 first";
        if (arrayFullResultsDef[1])
            arrayFullResultsDef[1].order = "col-xs-12 col-sm-12 col-md-6 second";
        if (arrayFullResultsDef[2])
            arrayFullResultsDef[2].order = "col-xs-12 col-sm-12 col-md-6 third";
        arrayFullResultsDef = arrayFullResultsDef.slice(0, 99);

        dbResults.insert({
            search: search,
            results: arrayFullResultsDef,
            ts: new Date()
        });
        Session.set("searching", false);
        //Router.go('/search/' + escape(query));
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
    arrayResultFilmFromKeyword = [];
    arrayResultKeyword = [];
    arrayFullResults = [];
    arrayFullResultsDef = [];
    Session.set('numberOfResults', 0);
}

/**
 * Write the query into the input field
 */
Template.search.helpers({
    query: function() {
        return Session.get('query');
    }
});