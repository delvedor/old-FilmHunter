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
    genres: [],
    cast: [],
    director: {},
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
    var i = 0;
    var genresLen = ris.genres.length;
    _.each(ris.genres, function(ele) {
        i++;
        if (i === genresLen) {
            arrayMovieInfo.genres.push({
                name: ele.name,
                link: ele.name.replace(/[^a-zA-Z0-9_:]/g, '-')
            });
        } else {
            arrayMovieInfo.genres.push({
                name: ele.name + ' - ',
                link: ele.name.replace(/[^a-zA-Z0-9_:]/g, '-')
            });
        }
    });
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
    var i = 0;
    _.each(ris.cast, function(ele) {
        if (i > 4)
            return;
        i++;
        if (i === 5) {
            arrayMovieInfo.cast.push({
                name: ele.name,
                link: ele.name.replace(/[^a-zA-Z0-9_:]/g, '-')
            });
        } else {
            arrayMovieInfo.cast.push({
                name: ele.name + ' - ',
                link: ele.name.replace(/[^a-zA-Z0-9_:]/g, '-')
            });
        }
    });
    _.each(ris.crew, function(ele) {
        if (ele.job === "Director") {
            arrayMovieInfo.director = {
                name: ele.name,
                link: ele.name.replace(/[^a-zA-Z0-9_:]/g, '-')
            };
            return;
        }
    });

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
        _.each(ris.results, function(ele) {
            if (ele.type === "Trailer" && ele.site === "YouTube") {
                arrayMovieInfo.trailer = (ele.key !== null ? "https://www.youtube.com/embed/" + ele.key + "?rel=0&amp;iv_load_policy=3&amp;theme=light" : "");
                return;
            }
        });
    } else {
        arrayMovieInfo.trailer = "";
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
        if (data.statuses.length === 0) {
            shuffle(arrayMovieInfoBoxes, 1);
            return;
        }
        _.each(data.statuses, function(ele) {
            arrayMovieInfoBoxes.push({
                boxType: 'boxTweet',
                background: 'background-color: #FAFAFA',
                isUser: true,
                isTwitter: true,
                user: ele.user.screen_name,
                text: ele.text,
                link: 'https://twitter.com/' + ele.user.screen_name
            });

        });

    }

    if (dataType === 'image') {
        var ris = $.parseJSON(data);
        var i = 0;
        if (ris.backdrops.length === 0) {
            shuffle(arrayMovieInfoBoxes, 1);
            return;
        }
        _.each(ris.backdrops, function(ele) {
            if (i === 20)
                return;
            i++;
            arrayMovieInfoBoxes.push({
                boxType: 'boxImage',
                background: 'background-image: url("http://image.tmdb.org/t/p/w500' + ele.file_path + '")',
                isUser: false
            });

        });
    }

    if (dataType === 'reviewtmdb') {
        var ris = $.parseJSON(data);
        var i = 0;
        if (ris.total_results === 0) {
            shuffle(arrayMovieInfoBoxes, 1);
            return;
        }
        _.each(ris.results, function(ele) {
            if (i === 2)
                return;
            i++;
            arrayMovieInfoBoxes.push({
                boxType: 'boxReview',
                background: 'background-color: #FAFAFA',
                isUser: true,
                isTwitter: false,
                user: ele.author + ' - TMDb',
                text: ele.content,
                link: ele.url
            });

        });
    }

    if (dataType === 'reviewmetacritic') {
        var ris = $.parseJSON(data);
        var i = 0;
        if (ris.count === 0) {
            shuffle(arrayMovieInfoBoxes, 1);
            return;
        }
        _.each(ris.result, function(ele) {
            if (i === 10)
                return;
            i++;
            arrayMovieInfoBoxes.push({
                boxType: 'boxReview',
                background: 'background-color: #FAFAFA',
                isUser: true,
                isTwitter: false,
                user: ele.critic,
                text: ele.excerpt,
                link: ele.link
            });

        });

    }

    shuffle(arrayMovieInfoBoxes, 1);
}

/**
 * Organize the results of the related movie.
 */
function searchSimilarFilm(data) {
    var ris = $.parseJSON(data);
    pagesSimilarFilm = ris.total_pages;
    if (ris.results.length === 0) {
        return;
    }
    var d = new Date();
    var date = parseInt(d.getFullYear() + '' + ((d.getMonth() + '').length === 1 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '' + ((d.getDate() + '').length === 1 ? '0' + d.getDate() : d.getDate()), 10);
    var release_date;
    _.each(ris.results, function(ele) {
        release_date = parseInt(ele.release_date.replace(/[-]/g, ''), 10);
        if (date < release_date)
            return;
        arrayResultSimilarFilm.push({
            title: ele.title,
            id: ele.id,
            image_path: (ele.poster_path !== null ? 'http://image.tmdb.org/t/p/w500' + ele.poster_path : '/blank.jpg'),
            order: (release_date % 2 === 0 ? 'big' : 'small')
        });
    });

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
        arrayMovieInfoBoxes = _.shuffle(array);
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
        genres: [],
        cast: [],
        director: {},
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
