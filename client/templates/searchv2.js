/* Variable Declaration */
var film,
    filmLen,
    filmCount,
    image;

var arrayResultKeyword = [];
var arrayResultKeywordDef = [];

var filmDep = new Deps.Dependency();
//Session.setDefault('searching', false);

/* Home Template Events */
Template.home.events({
    'keyup #filmSearch': function(e) {
        if (e.type == "keyup" && e.which == 13) {
            e.preventDefault();
            query = $('#filmSearch').val();
            if (query.replace(/\s/g, '') == "") {
                $('#filmSearch').val("");
                return;
            }
            startSearch($('#filmSearch').val());
            Session.set("searching", true);
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
        startSearch($('#filmSearch').val());
        Session.set("searching", true);
        Router.go('loading');
    }
});

/* Search Template Events */
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
            startSearch($('#film').val());
            Session.set("searching", true);
            Router.go('loading');
        }
    },

    'click #submitFilm': function(e) {
        e.preventDefault();
        query = $('#film').val();
        if (query.replace(/\s/g, '') == "") {
            $('#film').val("");
            Router.go('search');
            return;
        }
        startSearch($('#film').val());
        Session.set("searching", true);
        Router.go('loading');
    }
});

function startSearch(filmSearch) {
    filmCount = 0;
    arrayResultKeyword = [];
    arrayResultKeywordDef = [];
    Session.set('arrayResultFilm', []);
    Session.set('arrayResultKeyword', []);
    film = filmSearch.split(" ");
    filmLen = film.length;
    for (var i = 0; i < film.length; i++) {
        theMovieDb.search.getKeyword({
            "query": film[i],
            "page": 1
        }, searchKeyword, errorCB);
    }
}

function searchKeyword(data) {
    var ris = $.parseJSON(data);
    if (ris.total_results !== 0) {
        theMovieDb.keywords.getMovies({
            "id": ris.results[0].id
        }, printRis, errorCB);
    } else {
        allFinish(1);
    }
}

function printRis(data) {
    var ris = $.parseJSON(data);
    console.log('searchKeyword', ris);
    for (var i = 0; i < ris.results.length; i++) {
        image = (ris.results[i].poster_path != null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : 'image_not_found.jpg');
        image = image.replace(/\s/g, '');
        arrayResultKeyword.push({
            keyword: ris.id,
            title: ris.results[i].title,
            id: ris.results[i].id,
            popularity: ris.results[i].popularity,
            image_path: image,
            order: "col-xs-6 col-sm-4 col-md-4 standard"
        });
    }
    allFinish(0);
}

function allFinish(notfound) {
    filmCount++;
    if (notfound == filmLen) {
        Router.go('notfound');
        return;
    }

    if (filmCount == filmLen) {
        arrayResultKeyword.sort(function(a, b) {
            return b.popularity - a.popularity;
        });
        for (var i = 0; i < arrayResultKeyword.length - 1; i++) {
            if (arrayResultKeyword[i].title == arrayResultKeyword[i + 1].title) {
                continue;
            } else {
                arrayResultKeywordDef.push(arrayResultKeyword[i]);
            }
        }
        arrayResultKeywordDef.push(arrayResultKeyword[arrayResultKeyword.length - 1]);

        if (arrayResultKeywordDef[0])
            arrayResultKeywordDef[0].order = "col-xs-12 col-sm-12 col-md-12 first";
        if (arrayResultKeywordDef[1])
            arrayResultKeywordDef[1].order = "col-xs-12 col-sm-12 col-md-6 second";
        if (arrayResultKeywordDef[2])
            arrayResultKeywordDef[2].order = "col-xs-12 col-sm-12 col-md-6 third";
        arrayResultKeywordDef = arrayResultKeywordDef.slice(0, 99);

        Session.set('arrayResultFilm', arrayResultKeywordDef);
        Session.set("searching", false);
        Router.go('search');
    }
}

/* Api Error callback */
function errorCB(data) {
    console.log("Error callback: " + data);
}

/* Write the query into the input field */
Template.search.helpers({
    query: function() {
        filmDep.depend();
        return query;
    }
});

/* Color Generator */
Template.layout.rendered = function() {
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