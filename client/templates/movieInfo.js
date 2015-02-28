var linkYoutube;
var arrayMovieInfo = {};

Template.resultsFilm.events({
    'click .filmResult': function (e) {
        e.preventDefault();
        searchMovie(e.currentTarget.id)
    }
});

/* Starts the search of the movie info and the movie trailer*/
function searchMovie(movie) {
    theMovieDb.movies.getById({
        "id": movie
    }, getMovieInfo, errorCB);
    theMovieDb.movies.getTrailers({
        "id": movie
    }, getTrailer, errorCB);
    Router.go('movieInfo');
}

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

function getTrailer(data) {
    var ris = $.parseJSON(data);
    console.log('getTrailer', ris);
    if (ris.youtube.length != 0)
        linkYoutube = (ris.youtube[0].source != null ? "https://www.youtube.com/embed/" + ris.youtube[0].source + "?rel=0&amp;iv_load_policy=3&amp;theme=light" : "image_not_found.jpg");
    else
        linkYoutube = "image_not_found.jpg"
    arrayMovieInfo.trailer = linkYoutube;
    Session.set('arrayMovieInfo', arrayMovieInfo);
}

/* Api Error callback */
function errorCB(data) {
    console.log("Error callback: " + data);
}

Template.movieInfo.helpers({
    movieInfo: function () {
        /*if (Object.keys(Session.get('arrayMovieInfo')).length === 0)
            Router.go('/');*/
        return Session.get('arrayMovieInfo');
    }
});