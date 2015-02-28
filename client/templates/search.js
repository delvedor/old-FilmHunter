/* Variable Declaration */
var pagesFilm,
    pagesKeyword,
    film,
    image;

var arrayResultFilm = [];
var arrayResultKeyboard = [];

var filmDep = new Deps.Dependency();
Session.setDefault('searching', false);

/* Home Template Events */
Template.home.events({
    'keyup #filmSearch': function (e) {
        if (e.type == "keyup" && e.which == 13) {
            e.preventDefault();
            query = $('#filmSearch').val();
            if (query.replace(/\s/g, '') == "") {
                $('#filmSearch').val("");
                return;
            }
            startSearch(escape($('#filmSearch').val()));
            Session.set("searching", true);
            Router.go('loading');
        }
    },
    'click #goSearch': function (e) {
        e.preventDefault();
        query = $('#filmSearch').val();
        if (query.replace(/\s/g, '') == "") {
            $('#filmSearch').val("");
            return;
        }
        startSearch(escape($('#filmSearch').val()));
        Session.set("searching", true);
        Router.go('loading');
    }
});

/* Search Template Events */
Template.search.events({
    'keyup #film': function (e) {
        if (e.type == "keyup" && e.which == 13) {
            e.preventDefault();
            query = $('#film').val();
            if (query.replace(/\s/g, '') == "") {
                $('#film').val("");
                Router.go('search');
                return;
            }
            startSearch(escape($('#film').val()));
            Session.set("searching", true);
            Router.go('loading');
        }
    },

    'click #submitFilm': function (e) {
        e.preventDefault();
        query = $('#film').val();
        if (query.replace(/\s/g, '') == "") {
            $('#film').val("");
            Router.go('search');
            return;
        }
        startSearch(escape($('#film').val()));
        Session.set("searching", true);
        Router.go('loading');
    }
});

function startSearch(filmSearch) {
    pageFilm = 1;
    arrayResultFilm = [];
    pageKeyword = 1;
    arrayResultKeyboard = [];
    Session.set('arrayResultFilm', []);
    Session.set('arrayResultKeyboard', []);
    film = filmSearch;
    theMovieDb.search.getMovie({
        "query": film,
        "page": pageFilm,
        "include_adult": false
    }, searchFilm, errorCB);
    theMovieDb.search.getKeyword({
        "query": film,
        "page": pageKeyword,
    }, searchKeyword, errorCB);
}

function searchFilm(data) {
    var ris = $.parseJSON(data);
    pagesFilm = ris.total_pages;
    if (ris.results.length == 0) {
        Router.go('notfound');
        return;
    }
    for (var i = 0; i < ris.results.length; i++) {
        image = (ris.results[i].poster_path != null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : 'image_not_found.jpg');
        image = image.replace(/\s/g, '');
        arrayResultFilm.push({
            popularity: ris.results[i].popularity,
            title: ris.results[i].title,
            original_title: ris.results[i].original_title,
            id: ris.results[i].id,
            image_path: image,
            order: "col-xs-6 col-sm-4 col-md-4 standard"
        });
    }
    if (pagesFilm > 1 && pageFilm < pagesFilm) {
        pageFilm++;
        theMovieDb.search.getMovie({
            "query": film,
            "page": pageFilm,
            "include_adult": false
        }, searchFilm, errorCB);

    } else if (pageFilm == pagesFilm) {
        arrayResultFilm.sort(function (a, b) {
            return b.popularity - a.popularity
        });
        for (var i = 0; i < arrayResultFilm.length - 1; i++) {
            if (arrayResultFilm[i].title == arrayResultFilm[i + 1].title) {
                delete arrayResultFilm[i];
            }
        }
        if (arrayResultFilm[0])
            arrayResultFilm[0].order = "col-xs-12 col-sm-12 col-md-12 first";
        if (arrayResultFilm[1])
            arrayResultFilm[1].order = "col-xs-12 col-sm-12 col-md-6 second";
        if (arrayResultFilm[2])
            arrayResultFilm[2].order = "col-xs-12 col-sm-12 col-md-6 third";
        arrayResultFilm = arrayResultFilm.slice(0, 99);
        Session.set('arrayResultFilm', arrayResultFilm);
        Session.set("searching", false);
        Router.go('search');
    }
    console.log('searchFilm', ris);
}

function searchKeyword(data) {
    var ris = $.parseJSON(data);
    pagesKeyword = ris.total_pages;
    for (var i = 0; i < ris.results.length; i++) {
        arrayResultKeyboard.push({
            page: pageKeyword,
            name: ris.results[i].name,
            id: ris.results[i].id
        });
    }
    if (pagesKeyword > 1 && pageKeyword < pagesKeyword) {
        pageKeyword++;
        theMovieDb.search.getKeyword({
            "query": film,
            "page": pageKeyword
        }, searchKeyword, errorCB);

    } else if (pageKeyword == pagesKeyword) {
        arrayResultKeyboard = arrayResultKeyboard.slice(0, 51);
        Session.set('arrayResultKeyboard', arrayResultKeyboard);
    }
    console.log('searchKeyword', ris);
}

/* Api Error callback */
function errorCB(data) {
    console.log("Error callback: " + data);
}

/* Check if the 'Include Keyword' is true */
Template.resultsFilm.helpers({
    keyword: function () {
        return $('#incKey').is(":checked");
    }
});

/* Get the click event on a keyword and stars a new search */
Template.resultsKeyword.events({
    'click .keyword': function (e) {
        query = $(e.target).text();
        filmDep.changed();
        startSearch(escape($(e.target).text()));
    }
});

/* Write the query into the input field */
Template.search.helpers({
    query: function () {
        filmDep.depend();
        return query;
    }
});

/* Color Generator */
Template.layout.rendered = function () {
    var random = Math.floor(Math.random() * 3) + 1;
    var background;
    var border;
    var color;
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