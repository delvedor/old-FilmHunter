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

    searchRottenTomatoesId: function(search) {
        /*var tom = new Future();
        console.log(search);
        tomatoes.search(search, function(err, data) {
            console.log(data);
            if (data.length !== 0)
                tom.return(data[0].id);
            else
                tom.return('noResults');
        });
        return tom.wait();*/
        search = escape(search);
        return Meteor.http.call("GET", "http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey=" + rotten_tomatoes_api_key + "&q=" + search + "&page_limit=1", {
            headers: {
                "Accept": "application/json"
            }
        });
    },

    searchRottenTomatoesReviews: function(id) {
        return Meteor.http.call("GET", "http://api.rottentomatoes.com/api/public/v1.0/movies/" + id + "/reviews.json?apikey=" + rotten_tomatoes_api_key + "", {
            headers: {
                "Accept": "application/json"
            }
        });
    },

    searchTweets: function(query) {
        var tw = new Future();
        twit.get('search/tweets', {
            q: '#' + query,
            result_type: 'recent', // 'recent' or 'popular'
            count: 20,
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
