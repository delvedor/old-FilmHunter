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
var releaseDate;
var pageCount;

var arrayResultFilm = [];
var arrayResultGenre = [];
var arrayResultKeyword = [];

Router.route('/search', {
    path: '/search/:key',
    layout: 'resultsFilm',
    layoutTemplate: 'layout',
    onBeforeAction: function() {
        this.render('loadingRes');
        checkHistory((this.params.key).replace(/[^a-zA-Z0-9_:]/g, '-'));
        if (!Session.get('searching'))
            this.next();
    },
    action: function() {
        if (pageHistory[pageHistory.length - 1] !== '/search/' + (this.params.key).replace(/[^a-zA-Z0-9_:]/g, '-'))
            pageHistory.push('/search/' + (this.params.key).replace(/[^a-zA-Z0-9_:]/g, '-'));
        this.render('resultsFilm');
    }
});

function checkHistory(params) {
    for (var i = 0, sHlen = searchHistory.length; i < sHlen; ++i) {
        if (params === searchHistory[i]) {
            loadHistory(params);
            return;
        }
    }
    setSearch(params);
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
Template.layout.events({
    'keyup #filmSearch': function(e) {
        if (e.type === "keyup" && e.which === 13) {
            e.preventDefault();
            query = $('#filmSearch').val().trim();
            if (query.replace(/\s/g, '') === "") {
                $('#filmSearch').val("");
                return;
            }
            Router.go('/search/' + query.replace(/[^a-zA-Z0-9_:]/g, '-'));
        }
    },
    'click #goSearch': function(e) {
        e.preventDefault();
        query = $('#filmSearch').val().trim();
        if (query.replace(/\s/g, '') === "") {
            $('#filmSearch').val("");
            return;
        }
        Router.go('/search/' + query.replace(/[^a-zA-Z0-9_:]/g, '-'));
    }
});

Template.layout.helpers({
    settings: function() {
        return {
            position: "bottom",
            limit: 20,
            rules: [{
                token: 'g:',
                collection: genres,
                field: "name",
                matchAll: true,
                template: Template.dropdown
            }, {
                token: 'g: ',
                collection: genres,
                field: "name",
                matchAll: true,
                template: Template.dropdown
            }]
        };
    }
});

function setSearch(query) {
    searchHistory.push(query);
    Session.set("searching", true);
    startSearch(query.replace(/[-]/g, ' '));
}

/**
 * Starts the search based on the keyword.
 */
function startSearch(filmSearch) {
    resetVariables();
    search = filmSearch.replace(/[^a-zA-Z0-9_:]/g, '-');
    searchKey = filmSearch.substring(2).trim();
    searchKey = searchKey.trim();
    searchKey = escape(searchKey);
    film = filmSearch.split(" ");
    filmLen = film.length;

    if (filmSearch.substring(0, 2) === "d:" || filmSearch.substring(0, 2) === "a:") {
        Meteor.call('searchPerson', searchKey, function(err, result) {
            if (result) {
                var ris = $.parseJSON(result.content);
                if (ris.results.length === 0) {
                    Router.go('notfound');
                    return;
                }
                Meteor.call('searchPersonMovie', ris.results[0].id, function(err, result2) {
                    if (result2)
                        savePerson(result2.content, filmSearch.substring(0, 2));
                    if (err)
                        console.log(err);
                });
            }
            if (err)
                console.log(err);
        });
    } else if (filmSearch.substring(0, 2) === "g:") {
        var id = genres.find({
            check: filmSearch.replace(/\s/g, '').toLowerCase().substring(2)
        }).fetch();
        Meteor.call('searchGenreMovies', id[0].id, 1, function(err, result) {
            if (result)
                saveGenre(result.content, 2);
            if (err)
                console.log(err);
        });
    } else {
        for (var i = 0; i < filmLen; ++i) {
            Meteor.call('searchKeywords', film[i], function(err, result) {
                if (result)
                    searchMoviesFromKeyword(result.content);
                if (err)
                    console.log(err);
            });
        }
        Meteor.call('searchMovies', escape(filmSearch), pageCount, function(err, result) {
            if (result)
                saveMovies(result.content);
            if (err)
                console.log(err);
        });
    }

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
 * Saves and finalizes the results of the person search.
 */
function savePerson(data, typeSearch) {
    var ris = $.parseJSON(data);
    var arr = [];
    if (ris.cast.length + ris.crew.length === 0) {
        Router.go('notfound');
        return;
    }
    Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
    if (typeSearch === "a:")
        arr = ris.cast;
    if (typeSearch === "d:")
        arr = ris.crew;

    for (var i = 0, risLen = arr.length; i < risLen; ++i) {
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

function saveGenre(data, page) {
    var ris = $.parseJSON(data);
    if (page === 2)
        Session.set('numberOfResults', (Session.get('numberOfResults') + ris.total_results));
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
