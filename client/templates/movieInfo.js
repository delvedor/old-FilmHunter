var linkYoutube,
    movie,
    pageSimilarFilm,
    pageSimilarFilm;

var arrayMovieInfo = {};
var arrayResultSimilarFilm = [];

Template.resultsFilm.events({
    'click .filmResult': function (e) {
        e.preventDefault();
        movie = e.currentTarget.id;
        searchMovie(movie);
    }
});

Template.similarFilm.events({
    'click .filmResult': function (e) {
        e.preventDefault();
        //$('body,html').scrollTop(0);
        $('body,html').animate({
            scrollTop: 0
        }, '800', 'swing')
        movie = e.currentTarget.id;
        searchMovie(movie);
    }
});

/* Starts the search of the movie info and the movie trailer*/
function searchMovie(movie) {
    pageSimilarFilm = 1;
    theMovieDb.movies.getById({
        "id": movie
    }, getMovieInfo, errorCB);
    theMovieDb.movies.getTrailers({
        "id": movie
    }, getTrailer, errorCB);
    theMovieDb.movies.getSimilarMovies({
        "id": movie
    }, searchSimilarFilm, errorCB);
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

Template.similarFilm.helpers({
    similarFilmArr: function () {
        return Session.get('arrayResultSimilarFilm');
    }
});

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
    if (pagesSimilarFilm > 1 && pageSimilarFilm < pagesSimilarFilm) {
        pageSimilarFilm++;
        theMovieDb.movies.getSimilarMovies({
            "id": movie,
            "page": pageSimilarFilm
        }, searchSimilarFilm, errorCB);

    } else if (pageSimilarFilm == pagesSimilarFilm) {
        arrayResultSimilarFilm.sort(function (a, b) {
            return b.popularity - a.popularity
        });
        for (var i = 0; i < arrayResultSimilarFilm.length - 1; i++) {
            if (arrayResultSimilarFilm[i].title == arrayResultSimilarFilm[i + 1].title) {
                delete arrayResultSimilarFilm[i];
            }
        }
        arrayResultSimilarFilm = arrayResultSimilarFilm.slice(0, 18);
        Session.set('arrayResultSimilarFilm', arrayResultSimilarFilm);
    }
}