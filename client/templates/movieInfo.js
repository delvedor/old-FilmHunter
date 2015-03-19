/**
 * Variables declaration.
 */
var linkYoutube;
var movie;
var title;
var twitterTitle;
var pageSimilarFilm;

var arrayMovieInfo = {};
var arrayResultSimilarFilm = [];
var arrayMovieInfoBoxes = [];

/**
 * Get the click event on a film result and starts a search about that film.
 */
Template.resultsFilm.events({
    'click .filmResult': function(e) {
        e.preventDefault();
        clickEvent(e);
    }
});

/**
 * Get the click event on a related film result, starts a search about that film and scroll up the page.
 */
Template.similarFilm.events({
    'click .filmResult': function(e) {
        e.preventDefault();
        clickEvent(e);
        $('body,html').animate({
            scrollTop: 0
        }, '800', 'swing');
    }
});

Template.movieInfo.rendered = function() {
    $('body,html').scrollTop();
};

function clickEvent(e) {
    movie = e.currentTarget.id;
    title = $(e.currentTarget).text();
    twitterTitle = $(e.currentTarget).text().replace(/\s+/g, '');
    twitterTitle = title.replace(/[^a-zA-Z0-9_]/g, '');
    searchMovie(movie, title, twitterTitle);
}

/**
 * Search the movie info, the movie trailer and the related results.
 */
function searchMovie(movie, title, twitterTitle) {
    resetVariables();
    Meteor.call('getMovie', movie, function(err, result) {
        if (result)
            getMovieInfo(result.content);
        if (err)
            console.log(err);
    });

    Meteor.call('getMovieCredits', movie, function(err, result) {
        if (result)
            getMovieInfoCredits(result.content);
        if (err)
            console.log(err);
    });

    Meteor.call('getTrailer', movie, function(err, result) {
        if (result)
            getTrailer(result.content);
        if (err)
            console.log(err);
    });
    Meteor.call('getSimilarMovies', movie, function(err, result) {
        if (result)
            searchSimilarFilm(result.content);
        if (err)
            console.log(err);
    });

    Meteor.call('getMovieImages', movie, function(err, result) {
        if (result)
            setArrayMovieInfoBoxes(result.content, 'image');
        if (err)
            console.log(err);
    });

    Meteor.call('searchTweets', twitterTitle, function(err, result) {
        if (result)
            setArrayMovieInfoBoxes(result, 'tweet');
        if (err)
            console.log(err);
    });

    Meteor.call('searchRottenTomatoesId', title, function(err, result) {
        if (result) {
            if (result === "noResults")
                return;
            Meteor.call('searchRottenTomatoesReviews', result, function(err2, result2) {
                if (result2)
                    setArrayMovieInfoBoxes(result2, 'review');
                if (err2)
                    console.log(err2);
            });
        }
        if (err)
            console.log(err);
    });

    Router.go('movieInfo');
}

/**
 * Organize the results of the movie info.
 */
function getMovieInfo(data) {
    var ris = $.parseJSON(data);
    arrayMovieInfo.title = ris.title;
    arrayMovieInfo.tagline = ris.tagline;
    arrayMovieInfo.release_date = ris.release_date;
    arrayMovieInfo.plot = ris.overview;
    arrayMovieInfo.genres = "";
    for (var i = 0; i < ris.genres.length; i++) {
        if (i === 0)
            arrayMovieInfo.genres = arrayMovieInfo.genres + ris.genres[i].name;
        else
            arrayMovieInfo.genres = arrayMovieInfo.genres + ", " + ris.genres[i].name;
    }

    Session.set('arrayMovieInfo', arrayMovieInfo);
}

/**
 * Organize the credits of the selected movie.
 */
function getMovieInfoCredits(data) {
    var ris = $.parseJSON(data);
    var castLen = ris.cast.length;
    var crewLen = ris.crew.length;
    arrayMovieInfo.cast = "";
    arrayMovieInfo.director = "";
    for (var i = 0; i < castLen; i++) {
        if (i > 4)
            break;
        if (!i)
            arrayMovieInfo.cast = arrayMovieInfo.cast + ris.cast[i].name;
        else
            arrayMovieInfo.cast = arrayMovieInfo.cast + " - " + ris.cast[i].name;
    }
    for (var i = 0; i < crewLen; i++) {
        if (ris.crew[i].job === "Director") {
            arrayMovieInfo.director = ris.crew[i].name;
            break;
        }
    }

    Session.set('arrayMovieInfo', arrayMovieInfo);
}

/**
 * Find the correct film trailer and organize the results.
 */
function getTrailer(data) {
    var ris = $.parseJSON(data);
    console.log('getTrailer', ris);
    if (ris.results.length !== 0) {
        for (var i = 0; i < ris.results.length; i++) {
            if (ris.results[i].type === "Trailer" && ris.results[i].site === "YouTube") {
                linkYoutube = (ris.results[i].key !== null ? "https://www.youtube.com/embed/" + ris.results[i].key + "?rel=0&amp;iv_load_policy=3&amp;theme=light" : "image_not_found.jpg");
                break;
            }
        }
    } else {
        linkYoutube = "image_not_found.jpg";
    }
    arrayMovieInfo.trailer = linkYoutube;
    Session.set('arrayMovieInfo', arrayMovieInfo);
}

/**
 * Organize tweets, pictures and reviews of the selected film.
 */
function setArrayMovieInfoBoxes(data, dataType) {
    if (dataType === 'tweet') {
        var ris = data;
        console.log(ris);
        if (ris.statuses.length === 0)
            return;
        for (var i = 0; i < ris.statuses.length; i++) {
            arrayMovieInfoBoxes.push({
                boxType: 'boxTweet',
                background: 'background-color: #FAFAFA',
                isUser: true,
                isTwitter: true,
                user: ris.statuses[i].user.screen_name,
                text: ris.statuses[i].text
            });
        }
    }

    if (dataType === 'image') {
        var ris = $.parseJSON(data);
        if (ris.backdrops.length === 0)
            return;
        for (var i = 0; i < ris.backdrops.length; i++) {
            if (i > 20)
                break;
            arrayMovieInfoBoxes.push({
                boxType: 'boxImage',
                background: 'background-image: url("http://image.tmdb.org/t/p/w500' + ris.backdrops[i].file_path + '")',
                isUser: false,
                isTwitter: false,
                user: '',
                text: ''
            });
        }
    }

    if (dataType === 'review') {
        var ris = data;
        console.log(ris);
        if (ris.data.reviews.length === 0)
            return;
        for (var i = 0; i < ris.data.reviews.length; i++) {
            arrayMovieInfoBoxes.push({
                boxType: 'boxReview',
                background: 'background-color: #FAFAFA',
                isUser: true,
                isTwitter: false,
                user: ris.data.reviews[i].critic,
                text: ris.data.reviews[i].quote
            });
        }
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
    if (ris.results.length === 0) {
        return;
    }
    for (var i = 0; i < ris.results.length; i++) {
        image = (ris.results[i].poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : 'image_not_found.jpg');
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
    arrayResultSimilarFilm = arrayResultSimilarFilm.slice(0, 18);
    Session.set('arrayResultSimilarFilm', arrayResultSimilarFilm);
}

/**
 * Randomize the content of an array.
 * @return array shuffled.
 */
function shuffle(array) {
    var currentIndex = array.length;
    var temporaryValue;
    var randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

/**
 * Reset all the variables for a new movieInfo.
 */
function resetVariables() {
    arrayMovieInfo = {};
    arrayResultSimilarFilm = [];
    arrayMovieInfoBoxes = [];
    Session.set('arrayMovieInfo', {});
    Session.set('arrayResultSimilarFilm', []);
    Session.set('arrayMovieInfoBoxes', []);
}