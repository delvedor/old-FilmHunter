Future = Npm.require('fibers/future');

Meteor.methods({
    saveBugReport: function(br) {
        bugreport.insert({
            ip: this.connection.clientAddress,
            ts: new Date(),
            bugReportText: br
        });
        return true;
    },

    searchKeywords: function(keyword) {
        return Meteor.http.call("GET", "http://api.themoviedb.org/3/search/keyword?api_key=" + tmdb_api_key + "&query=" + keyword + "&page=1", {
            headers: {
                "Accept": "application/json"
            }
        });
    },

    searchMoviesFromKeyword: function(id) {
        return Meteor.http.call("GET", "http://api.themoviedb.org/3/keyword/" + id + "/movies?api_key=" + tmdb_api_key + "&page=1", {
            headers: {
                "Accept": "application/json"
            }
        });
    },

    getMovie: function(id) {
        return Meteor.http.call("GET", "http://api.themoviedb.org/3/movie/" + id + "?api_key=" + tmdb_api_key + "&page=1", {
            headers: {
                "Accept": "application/json"
            }
        });
    },

    getMovieCredits: function(id) {
        return Meteor.http.call("GET", "http://api.themoviedb.org/3/movie/" + id + "/credits?api_key=" + tmdb_api_key + "&page=1", {
            headers: {
                "Accept": "application/json"
            }
        });
    },

    getTrailer: function(id) {
        return Meteor.http.call("GET", "http://api.themoviedb.org/3/movie/" + id + "/videos?api_key=" + tmdb_api_key + "&page=1", {
            headers: {
                "Accept": "application/json"
            }
        });
    },

    getSimilarMovies: function(id) {
        return Meteor.http.call("GET", "http://api.themoviedb.org/3/movie/" + id + "/similar?api_key=" + tmdb_api_key + "&page=1", {
            headers: {
                "Accept": "application/json"
            }
        });
    },

    getMovieImages: function(id) {
        return Meteor.http.call("GET", "http://api.themoviedb.org/3/movie/" + id + "/images?api_key=" + tmdb_api_key + "", {
            headers: {
                "Accept": "application/json"
            }
        });
    },

    searchMovies: function(search, page) {
        var query = escape(search);
        return Meteor.http.call("GET", "http://api.themoviedb.org/3/search/movie?api_key=" + tmdb_api_key + "&query=" + query + "&page=" + page + "&include_adult=false", {
            headers: {
                "Accept": "application/json"
            }
        });
    },

    getMovieReviewsFromTmdb: function(id) {
        return Meteor.http.call("GET", "http://api.themoviedb.org/3/movie/" + id + "/reviews?api_key=" + tmdb_api_key + "", {
            headers: {
                "Accept": "application/json"
            }
        });
    },

    getMovieReviewsFromMetacritic: function(title) {
        return Meteor.http.call("GET", "https://byroredux-metacritic.p.mashape.com/reviews?url=http%3A%2F%2Fwww.metacritic.com%2Fmovie%2F" + title + "", {
            headers: {
                "X-Mashape-Key": mashape_api_key,
                "Accept": "application/json"
            }
        });
    },


    searchTweets: function(query) {
        var tw = new Future();
        twit.get('search/tweets', {
            q: '#' + query,
            result_type: 'recent', // 'recent' or 'popular'
            count: 15,
            lang: 'en'
        }, function(err, data, response) {
            if (err)
                tw.throw(err);
            else
                tw.return(data);
        });

        return tw.wait();
    }


});
