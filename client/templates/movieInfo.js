/**
 * Variables declaration.
 */
var linkYoutube,
    movie,
    title,
    pageSimilarFilm,
    pageSimilarFilm;

var arrayMovieInfo = {};
var arrayResultSimilarFilm = [];
var arrayMovieInfoBoxes = [];
/**
 * Get the click event on a film result and starts a search about that film.
 */
Template.resultsFilm.events({
    'click .filmResult': function(e) {
        e.preventDefault();
        movie = e.currentTarget.id;
        title = $(e.currentTarget).text().replace(/\s+/g, '');
        title = title.replace(/[^a-zA-Z0-9_]/g, '');
        searchMovie(movie, title);
    }
});

/**
 * Get the click event on a related film result, starts a search about that film and scroll up the page.
 */
Template.similarFilm.events({
    'click .filmResult': function(e) {
        e.preventDefault();
        movie = e.currentTarget.id;
        title = $(e.currentTarget).text().replace(/\s+/g, '');
        title = title.replace(/[^a-zA-Z0-9_]/g, '');
        $('body,html').animate({
            scrollTop: 0
        }, '800', 'swing')
        movie = e.currentTarget.id;
        searchMovie(movie, title);
    }
});

/**
 * Search the movie info, the movie trailer and the related results.
 */
function searchMovie(movie, title) {
    pageSimilarFilm = 1;
    arrayMovieInfo = {};
    arrayResultSimilarFilm = [];
    arrayMovieInfoBoxes = [];
    Meteor.call('getMovie', movie, function(err, result) {
        if (result) {
            //console.log(result.content);
            getMovieInfo(result.content);
        }
        if (err) {
            console.log(err);
        }
    });

    Meteor.call('getMovieCredits', movie, function(err, result) {
        if (result) {
            //console.log(result.content);
            getMovieInfoCredits(result.content);
        }
        if (err) {
            console.log(err);
        }
    });

    Meteor.call('getTrailer', movie, function(err, result) {
        if (result) {
            //console.log(result.content);
            getTrailer(result.content);
        }
        if (err) {
            console.log(err);
        }
    });
    Meteor.call('getSimilarMovies', movie, function(err, result) {
        if (result) {
            //console.log(result.content);
            searchSimilarFilm(result.content);
        }
        if (err) {
            console.log(err);
        }
    });

    Meteor.call('getMovieImages', movie, function(err, result) {
        if (result) {
            //console.log(result.content);
            setArrayMovieInfoBoxes(result.content, 'image');
        }
        if (err) {
            console.log(err);
        }
    });

    Meteor.call('searchTweets', title, function(err, result) {
        if (result) {
            //console.log('searchTweets', result);
            setArrayMovieInfoBoxes(result, 'tweet');
        }
        if (err) {
            console.log(err);
        }
    });
    Router.go('movieInfo');
}

/**
 * Organize the results of the movie info.
 */
function getMovieInfo(data) {
    var ris = $.parseJSON(data);
    console.log('getMovieInfo', ris);
    arrayMovieInfo.title = ris.title;
    arrayMovieInfo.tagline = ris.tagline;
    arrayMovieInfo.release_date = ris.release_date;
    arrayMovieInfo.plot = ris.overview;
    arrayMovieInfo.genres = "";
    for (var i = 0; i < ris.genres.length; i++) {
        if (i == 0)
            arrayMovieInfo.genres = arrayMovieInfo.genres + ris.genres[i].name;
        else
            arrayMovieInfo.genres = arrayMovieInfo.genres + ", " + ris.genres[i].name;
    }

    Session.set('arrayMovieInfo', arrayMovieInfo);
}

function getMovieInfoCredits(data) {
    var ris = $.parseJSON(data);
    console.log('getMovieInfoCredits', ris);
    arrayMovieInfo.cast = "";
    arrayMovieInfo.director = "";
    for (var i = 0; i < ris.cast.length; i++) {
        if (i < 5) {
            if (i == 0)
                arrayMovieInfo.cast = arrayMovieInfo.cast + ris.cast[i].name;
            else
                arrayMovieInfo.cast = arrayMovieInfo.cast + " - " + ris.cast[i].name;
        }
    }
    for (var i = 0; i < ris.crew.length; i++) {
        if (ris.crew[i].job == "Director")
            arrayMovieInfo.director = ris.crew[i].name;
    }

    Session.set('arrayMovieInfo', arrayMovieInfo);
}

/**
 * Find the correct film trailer and organize the results.
 */
function getTrailer(data) {
    var ris = $.parseJSON(data);
    console.log('getTrailer', ris);
    if (ris.results.length != 0) {
        for (var i = 0; i < ris.results.length; i++) {
            if (ris.results[i].type == "Trailer" && ris.results[i].site == "YouTube") {
                linkYoutube = (ris.results[i].key != null ? "https://www.youtube.com/embed/" + ris.results[i].key + "?rel=0&amp;iv_load_policy=3&amp;theme=light" : "image_not_found.jpg");
                break;
            }
        }
    } else {
        linkYoutube = "image_not_found.jpg"
    }
    arrayMovieInfo.trailer = linkYoutube;
    Session.set('arrayMovieInfo', arrayMovieInfo);
}

function setArrayMovieInfoBoxes(data, dataType) {
    if (dataType == 'tweet') {
        var ris = data;
        console.log(ris);
        if (ris.statuses.length == 0)
            return;
        for (var i = 0; i < ris.statuses.length; i++) {
            arrayMovieInfoBoxes.push({
                boxType: 'boxTweet',
                background: 'background-color: #FAFAFA',
                isUser: true,
                user: ris.statuses[i].user.screen_name,
                text: ris.statuses[i].text
            });
        }
    }

    if (dataType == 'image') {
        var ris = $.parseJSON(data);
        if (ris.backdrops.length == 0)
            return;
        for (var i = 0; i < ris.backdrops.length; i++) {
            if (i > 20)
                break;
            arrayMovieInfoBoxes.push({
                boxType: 'boxImage',
                background: 'background-image: url("http://image.tmdb.org/t/p/w500' + ris.backdrops[i].file_path + '")',
                isUser: false,
                user: '',
                text: ''
            });
        }
    }

    if (dataType == 'review') {
        var ris = $.parseJSON(data);
    }

    shuffle(arrayMovieInfoBoxes);
    Session.set('arrayMovieInfoBoxes', arrayMovieInfoBoxes);
}

/**
 * Api Error callback
 */
function errorCB(data) {
    console.log("Error callback: " + data);
}

/**
 * Helper for rective data of the movie info.
 */
Template.movieInfo.helpers({
    movieInfo: function() {
        return Session.get('arrayMovieInfo');
    },

    movieInfoBoxes: function() {
        return Session.get('arrayMovieInfoBoxes');
    }
});

/**
 * Helper for rective data of the related movie.
 */
Template.similarFilm.helpers({
    similarFilmArr: function() {
        return Session.get('arrayResultSimilarFilm');
    }
});


/**
 * Organize the results of the related movie.
 */
function searchSimilarFilm(data) {
    var ris = $.parseJSON(data);
    console.log('searchSimilarFilm', ris);
    pagesSimilarFilm = ris.total_pages;
    if (ris.results.length == 0) {
        return;
    }
    for (var i = 0; i < ris.results.length; i++) {
        image = (ris.results[i].poster_path != null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : 'image_not_found.jpg');
        image = image.replace(/\s/g, '');
        arrayResultSimilarFilm.push({
            popularity: ris.results[i].popularity,
            title: ris.results[i].title,
            original_title: ris.results[i].original_title,
            id: ris.results[i].id,
            image_path: image,
            order: "col-xs-6 col-sm-4 col-md-4 standard"
        });
    }
    /*if (pagesSimilarFilm > 1 && pageSimilarFilm < pagesSimilarFilm) {
        pageSimilarFilm++;
        theMovieDb.movies.getSimilarMovies({
            "id": movie,
            "page": pageSimilarFilm
        }, searchSimilarFilm, errorCB);

    } else if (pageSimilarFilm == pagesSimilarFilm) {*/
    arrayResultSimilarFilm = arrayResultSimilarFilm.slice(0, 18);
    Session.set('arrayResultSimilarFilm', arrayResultSimilarFilm);
    //}
}

function shuffle(array) {
    console.log('suffle1');
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    console.log('suffle2');
    return array;
}