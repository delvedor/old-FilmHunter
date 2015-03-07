/**
 * Variables declaration.
 */
var linkYoutube,
    movie,
    pageSimilarFilm,
    pageSimilarFilm;

var arrayMovieInfo = {};
var arrayResultSimilarFilm = [];

/**
 * Get the click event on a film result and starts a search about that film.
 */
Template.resultsFilm.events({
    'click .filmResult': function(e) {
        e.preventDefault();
        movie = e.currentTarget.id;
        searchMovie(movie);
    }
});

/**
 * Get the click event on a related film result, starts a search about that film and scroll up the page.
 */
Template.similarFilm.events({
    'click .filmResult': function(e) {
        e.preventDefault();
        $('body,html').animate({
            scrollTop: 0
        }, '800', 'swing')
        movie = e.currentTarget.id;
        searchMovie(movie);
    }
});

/**
 * Search the movie info, the movie trailer and the related results.
 */
function searchMovie(movie) {
    pageSimilarFilm = 1;
    Meteor.call('getMovie', movie, function(err, result) {
        if (result) {
            //console.log(result.content);
            getMovieInfo(result.content);
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
    arrayMovieInfo.genres = "";
    for (var i = 0; i < ris.genres.length; i++) {
        if (i == 0)
            arrayMovieInfo.genres = arrayMovieInfo.genres + ris.genres[i].name;
        else
            arrayMovieInfo.genres = arrayMovieInfo.genres + ", " + ris.genres[i].name;
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