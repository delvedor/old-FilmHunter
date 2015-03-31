/**
 * Variables declaration.
 */

var finCount = 0;
var movie = "";
var title = "";
var metacriticTitle = "";
var twitterTitle = "";

var arrayMovieInfo = {
    id: "",
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

Router.route('/movie', {
    path: '/movie/:key',
    layout: 'movieInfo',
    layoutTemplate: 'layout',
    onBeforeAction: function() {
        this.render('loading');
        checkHistory(escape(this.params.key));
        if (!Session.get('searching'))
            this.next();
    },
    action: function() {
        if (pageHistory[pageHistory.length - 1] !== '/movie/' + escape(this.params.key))
            pageHistory.push('/movie/' + escape(this.params.key));
        this.render('movieInfo');
    }
});

/**
 * Get the click event on a film result and redirect to the dynamic movieInfo page.
 */
Template.resultsFilm.events({
    'click .filmResult-col': function(e) {
        e.preventDefault();
        Router.go('/movie/' + e.currentTarget.id);
    }
});

/**
 * Get the click event on a related film result, redirect to the dynamic movieInfo page and scroll up the page.
 */
Template.similarFilm.events({
    'click .filmResult-col': function(e) {
        e.preventDefault();
        Router.go('/movie/' + e.currentTarget.id);
        $('body,html').animate({
            scrollTop: 0
        }, '800', 'swing');
    }
});


function checkHistory(id) {
    Session.set("searching", true);
    for (var i = 0, mHLen = movieHistory.length; i < mHLen; ++i) {
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
            arrayMovieInfo.id = id;
            movie = id;
            title = ris.title.replace(/\s+/g, '');
            metacriticTitle = ris.title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, '-').toLowerCase();
            twitterTitle = title.replace(/[^a-zA-Z0-9_]/g, '');
            searchMovie(ris);
        }
        if (err)
            console.log(err);
    });
    //allFinish(1, 0);

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
            shuffle(arrayMovieInfoBoxes, 1);
    });

    Meteor.call('searchTweets', twitterTitle, function(err, result) {
        if (result)
            setArrayMovieInfoBoxes(result, 'tweet');
        if (err)
            shuffle(arrayMovieInfoBoxes, 1);
    });

    Meteor.call('getMovieReviewsFromTmdb', movie, function(err, result) {
        if (result)
            setArrayMovieInfoBoxes(result.content, 'reviewtmdb');
        if (err)
            shuffle(arrayMovieInfoBoxes, 1);
    });

    Meteor.call('getMovieReviewsFromMetacritic', metacriticTitle, function(err, result) {
        if (result)
            setArrayMovieInfoBoxes(result.content, 'reviewmetacritic');
        if (err)
            shuffle(arrayMovieInfoBoxes, 1);
    });

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
}

/**
 * Find the correct film trailer and organize the results.
 */
function getTrailer(data) {
    var ris = $.parseJSON(data);
    if (ris.results.length !== 0) {
        for (var i = 0, trailerLen = ris.results.length; i < trailerLen; ++i) {
            if (ris.results[i].type === "Trailer" && ris.results[i].site === "YouTube") {
                arrayMovieInfo.trailer = (ris.results[i].key !== null ? "https://www.youtube.com/embed/" + ris.results[i].key + "?rel=0&amp;iv_load_policy=3&amp;theme=light" : "/blank.jpg");
                break;
            }
        }
    } else {
        arrayMovieInfo.trailer = "/blank.png";
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
        if (statusesLen === 0) {
            shuffle(arrayMovieInfoBoxes, 1);
            return;
        }
        for (var i = 0; i < statusesLen; ++i) {
            arrayMovieInfoBoxes.push({
                boxType: 'boxTweet',
                background: 'background-color: #FAFAFA',
                isUser: true,
                isTwitter: true,
                user: ris.statuses[i].user.screen_name,
                text: ris.statuses[i].text,
                link: 'https://twitter.com/' + ris.statuses[i].user.screen_name
            });
        }
    }

    if (dataType === 'image') {
        var ris = $.parseJSON(data);
        var backdropsLen = ris.backdrops.length;
        if (backdropsLen === 0) {
            shuffle(arrayMovieInfoBoxes, 1);
            return;
        }
        for (var i = 0; i < backdropsLen; ++i) {
            if (i > 20)
                break;
            arrayMovieInfoBoxes.push({
                boxType: 'boxImage',
                background: 'background-image: url("http://image.tmdb.org/t/p/w500' + ris.backdrops[i].file_path + '")',
                isUser: false,
                isTwitter: false,
                user: '',
                text: '',
                link: ''
            });
        }
    }

    if (dataType === 'reviewtmdb') {
        var ris = $.parseJSON(data);
        var reviewsLen = ris.total_results;
        if (reviewsLen === 0) {
            shuffle(arrayMovieInfoBoxes, 1);
            return;
        }
        for (var i = 0; i < reviewsLen; ++i) {
            if (i === 3)
                break;
            arrayMovieInfoBoxes.push({
                boxType: 'boxReview',
                background: 'background-color: #FAFAFA',
                isUser: true,
                isTwitter: false,
                user: ris.results[i].author + ' - TMDb',
                text: ris.results[i].content,
                link: ris.results[i].url
            });
        }
    }

    if (dataType === 'reviewmetacritic') {
        var ris = $.parseJSON(data);
        var reviewsLen = ris.count;
        if (reviewsLen === 0) {
            shuffle(arrayMovieInfoBoxes, 1);
            return;
        }
        for (var i = 0; i < reviewsLen; ++i) {
            if (i === 10)
                break;
            arrayMovieInfoBoxes.push({
                boxType: 'boxReview',
                background: 'background-color: #FAFAFA',
                isUser: true,
                isTwitter: false,
                user: ris.result[i].critic,
                text: ris.result[i].excerpt,
                link: ris.result[i].link
            });
        }

    }

    shuffle(arrayMovieInfoBoxes, 1);
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
    var d = new Date();
    var date = d.getFullYear() + '' + d.getMonth() + 1 + '' + d.getDate();
    var release_date;
    var order;
    for (var i = 0; i < similarLen; ++i) {
        image = (ris.results[i].poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ris.results[i].poster_path : '/blank.jpg');
        image = image.replace(/\s/g, '');
        release_date = parseInt(ris.results[i].release_date.replace(/[-]/g, ''), 10);
        if (parseInt(date, 10) < release_date)
            continue;
        order = (i % 3 === 0 ? 'big' : 'small');
        arrayResultSimilarFilm.push({
            popularity: ris.results[i].popularity,
            title: ris.results[i].title,
            original_title: ris.results[i].original_title,
            id: ris.results[i].id,
            image_path: image,
            order: order
        });
    }

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
}

function allFinish(finish, cache) {
    if (cache === 1)
        Session.set("searching", false);
    if (finish === 1)
        Session.set("searching", false);
}

/**
 * Randomize the content of an array.
 */
function shuffle(array, count) {
    finCount += count;
    if (finCount >= 4) {
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
    finCount = 0;
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
        Meteor.setTimeout(setGrid, 300);
        if (!dbMovieInfo.findOne())
            return [];
        return dbMovieInfo.findOne({}, {
            sort: {
                ts: -1
            }
        }).similarFilm;
    }
});

/**
 * Corrects the height of the div standard
 */
function setGrid() {
    var container = document.querySelector('.gridInfo');
    var iso = new Isotope(container, {
        itemSelector: '.colElement-movieInfo',
        masonry: {
            isFitWidth: true
        }
    });
    var container = document.querySelector('.resultsGrid');
    var iso = new Isotope(container, {
        itemSelector: '.colElement-results',
        masonry: {
            isFitWidth: true
        }
    });
}


Template.movieInfo.rendered = function() {
    $('body,html').scrollTop();
};
