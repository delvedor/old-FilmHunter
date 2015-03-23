/**
 * Variables declaration.
 */

var finished = 0;
var movie = "";
var title = "";
var twitterTitle = "";

var arrayMovieInfo = {
    title: "",
    tagline: "",
    release_date: "",
    plot: "",
    genres: "",
    caste: "",
    director: "",
    trailer: ""
};
var arrayResultSimilarFilm = [];
var arrayMovieInfoBoxes = [];

Router.route('/movieInfo', {
    path: '/movieInfo/:key',
    layout: 'movieInfo',
    layoutTemplate: 'layout',
    onBeforeAction: function() {
        this.render('loadingNoRis');
        checkHistory(escape(this.params.key));
        if (!Session.get('searching'))
            this.next();
    },
    action: function() {
        if (pageHistory[pageHistory.length - 1] !== '/movieInfo/' + escape(this.params.key))
            pageHistory.push('/movieInfo/' + escape(this.params.key));
        this.render('movieInfo');
    }
});

/**
 * Get the click event on a film result and redirect to the dynamic movieInfo page.
 */
Template.resultsFilm.events({
    'click .filmResult': function(e) {
        e.preventDefault();
        Router.go('/movieInfo/' + e.currentTarget.id);
    }
});

/**
 * Get the click event on a related film result, redirect to the dynamic movieInfo page and scroll up the page.
 */
Template.similarFilm.events({
    'click .filmResult': function(e) {
        e.preventDefault();
        Router.go('/movieInfo/' + e.currentTarget.id);
        $('body,html').animate({
            scrollTop: 0
        }, '800', 'swing');
    }
});


function checkHistory(id) {
    Session.set("searching", true);
    for
 (var i = 0, mHLen = movieHistory.length; i < mHLen; ++i) {
        if (id === movieHistory[i]) {
            loadHistory(id);
            return;
        }
    }
    getMovieById(id);
}

function loadHistory(id) {
    dbMovieInfo.update({
        idMovie: id
    }, {
        $unset: {
            ts: ""
        },
        $set: {
            ts: new Date()
        }
    });
    allFinish(0, 1);
}

/**
 * Get the title of the movie by id and starts the search for the movieBoxes.
 */
function getMovieById(id) {
    movieHistory.push(id);
    resetVariables();
    Meteor.call('getMovie', id, function(err, result) {
        if (result) {
            var ris = $.parseJSON(result.content);
            movie = id;
            title = ris.title.replace(/\s+/g, '');
            twitterTitle = ris.title.replace(/\s+/g, '');
            twitterTitle = title.replace(/[^a-zA-Z0-9_]/g, '');
            searchMovie(ris);
        }
        if (err)
            console.log(err);
    });
    allFinish(1, 0);

}

/**
 * Search the movie info, the movie trailer and the related results.
 */
function searchMovie(ris) {
        getMovieInfo(ris);

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

        /*Meteor.call('searchRottenTomatoesId', title, function(err, result) {
            console.log(result);
            if (result) {
                if (result === "noResults")
                    return;
                Meteor.call('searchRottenTomatoesReviews', result, function(err2, result2) {
                    console.log(result2);
                    if (result2)
                        setArrayMovieInfoBoxes(result2, 'review');
                    if (err2)
                        console.log(err2);
                });
            }
            if (err)
                console.log(err);
        });*/
        dbMovieInfo.insert({
            idMovie: movie,
            title: title,
            movieInfo: [],
            movieBoxes: [],
            similarFilm: [],
            ts: new Date()
        });
    }
    /**
     * Organize the results of the movie info.
     */
function getMovieInfo(ris) {
    arrayMovieInfo.title = ris.title;
    arrayMovieInfo.tagline = ris.tagline;
    arrayMovieInfo.release_date = ris.release_date;
    arrayMovieInfo.plot = ris.overview;
    arrayMovieInfo.genres = "";
    for (var i = 0, genresLen = ris.genres.length; i < genresLen; ++i) {
        if (i === 0)
            arrayMovieInfo.genres = arrayMovieInfo.genres + ris.genres[i].name;
        else
            arrayMovieInfo.genres = arrayMovieInfo.genres + ", " + ris.genres[i].name;
    }
    dbMovieInfo.update({
        idMovie: movie
    }, {
        $unset: {
            movieInfo: arrayMovieInfo
        },
        $set: {
            movieInfo: arrayMovieInfo
        }
    });
    allFinish(1, 0);
}

/**
 * Organize the credits of the selected movie.
 */
function getMovieInfoCredits(data) {
    var ris = $.parseJSON(data);
    arrayMovieInfo.cast = "";
    arrayMovieInfo.director = "";
    for (var i = 0, castLen = ris.cast.length; i < castLen; ++i) {
        if (i > 4)
            break;
        if (!i)
            arrayMovieInfo.cast = arrayMovieInfo.cast + ris.cast[i].name;
        else
            arrayMovieInfo.cast = arrayMovieInfo.cast + " - " + ris.cast[i].name;
    }
    for (var i = 0, crewLen = ris.crew.length; i < crewLen; ++i) {
        if (ris.crew[i].job === "Director") {
            arrayMovieInfo.director = ris.crew[i].name;
            break;
        }
    }

    dbMovieInfo.update({
        idMovie: movie
    }, {
        $unset: {
            movieInfo: arrayMovieInfo
        },
        $set: {
            movieInfo: arrayMovieInfo
        }
    });
    allFinish(1, 0);
}

/**
 * Find the correct film trailer and organize the results.
 */
function getTrailer(data) {
    var ris = $.parseJSON(data);
    if (ris.results.length !== 0) {
        for (var i = 0, trailerLen = ris.results.length; i < trailerLen; ++i) {
            if (ris.results[i].type === "Trailer" && ris.results[i].site === "YouTube") {
                arrayMovieInfo.trailer = (ris.results[i].key !== null ? "https://www.youtube.com/embed/" + ris.results[i].key + "?rel=0&amp;iv_load_policy=3&amp;theme=light" : "http://www.51allout.co.uk/wp-content/uploads/2012/02/Image-not-found-300x300.gif");
                break;
            }
        }
    } else {
        arrayMovieInfo.trailer = "http://www.51allout.co.uk/wp-content/uploads/2012/02/Image-not-found-300x300.gif";
    }
    dbMovieInfo.update({
        idMovie: movie
    }, {
        $unset: {
            movieInfo: arrayMovieInfo
        },
        $set: {
            movieInfo: arrayMovieInfo
        }
    });
}

/**
 * Organize tweets, pictures and reviews of the selected film.
 */
function setArrayMovieInfoBoxes(data, dataType) {
    if (dataType === 'tweet') {
        var ris = data;
        var statusesLen = ris.statuses.length;
        if (statusesLen === 0)
            return;
        for (var i = 0; i < statusesLen; ++i) {
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
        var backdropsLen = ris.backdrops.length;
        if (backdropsLen === 0)
            return;
        for (var i = 0; i < backdropsLen; ++i) {
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
        var reviewsLen = ris.data.reviews.length;
        if (reviewsLen === 0)
            return;
        for (var i = 0; i < reviewsLen; ++i) {
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
}

/**
 * Organize the results of the related movie.
 */
function searchSimilarFilm(data) {
    var ris = $.parseJSON(data);
    var similarLen = ris.results.length;
    pagesSimilarFilm = ris.total_pages;
    if (similarLen === 0) {
        return;
    }
    for (var i = 0; i < similarLen; ++i) {
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
    dbMovieInfo.update({
        idMovie: movie
    }, {
        $unset: {
            similarFilm: arrayResultSimilarFilm
        },
        $set: {
            similarFilm: arrayResultSimilarFilm
        }
    });
    allFinish(1, 0);
}

function allFinish(finish, cache) {
    if (cache === 1)
        Session.set("searching", false);
    finished += finish;
    if (finished === 4)
        Session.set("searching", false);
}

/**
 * Randomize the content of an array.
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
    dbMovieInfo.update({
        idMovie: movie
    }, {
        $unset: {
            movieBoxes: arrayMovieInfoBoxes
        },
        $set: {
            movieBoxes: arrayMovieInfoBoxes
        }
    });
    allFinish(1, 0);
}

/**
 * Reset all the variables for a new movieInfo.
 */
function resetVariables() {
    arrayMovieInfo = {
        title: "",
        tagline: "",
        release_date: "",
        plot: "",
        genres: "",
        caste: "",
        director: "",
        trailer: ""
    };
    arrayResultSimilarFilm = [];
    arrayMovieInfoBoxes = [];
    finished = 0;
}

/**
 * Helper for rective data of the movie info.
 */
Template.movieInfo.helpers({
    movieInfo: function() {
        if (!dbMovieInfo.findOne())
            return [];
        return dbMovieInfo.findOne({}, {
            sort: {
                ts: -1
            }
        }).movieInfo;

    },

    movieInfoBoxes: function() {
        if (!dbMovieInfo.findOne())
            return [];
        return dbMovieInfo.findOne({}, {
            sort: {
                ts: -1
            }
        }).movieBoxes;
    }
});

/**
 * Helper for rective data of the related movie.
 */
Template.similarFilm.helpers({
    similarFilmArr: function() {
        if (!dbMovieInfo.findOne())
            return [];
        return dbMovieInfo.findOne({}, {
            sort: {
                ts: -1
            }
        }).similarFilm;
    }
});

Template.movieInfo.rendered = function() {
    $('body,html').scrollTop();
};
