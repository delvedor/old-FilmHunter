Future = Npm.require('fibers/future');

Meteor.methods({
    removeAccount: function(userId) {
        if (!Match.test(userId, String))
            return false;
        if (userId === this.userId) {
            Meteor.users.remove(userId);
            favourites.remove({
                id: userId
            });
            return true;
        }
        return false;

    },

    saveBugReport: function(br, userId) {
        if (!Match.test(br, String) && (!Match.test(userId, String) || !Match.test(userId, null)))
            return false;
        bugreport.insert({
            user: userId,
            ip: this.connection.clientAddress,
            ts: new Date(),
            bugReportText: br
        });
        return true;
    },

    createFavourites: function(userId) {
        if (!Match.test(userId, String))
            return false;
        favourites.insert({
            id: userId,
            fav: []
        });
    },

    addFavourites: function(userId, fav) {
        if (!Match.test(userId, String) || !Match.test(fav, {
                id: String,
                title: String,
                image: String,
                order: String
            })) {
            return false;
        }
        favourites.update({
            id: userId
        }, {
            $push: {
                fav: fav
            }
        });
    },

    removeFavourites: function(userId, fav) {
        if (!Match.test(userId, String) || !Match.test(fav, {
                id: String
            })) {
            return false;
        }
        favourites.update({
            id: userId
        }, {
            $pull: {
                fav: fav
            }
        });
    },

    searchPerson: function(name) {
        if (!Match.test(name, String))
            return false;
        try {
            return Meteor.http.call("GET", "http://api.themoviedb.org/3/search/person?api_key=" + tmdb_api_key + "&query=" + name + "&page=1", {
                headers: {
                    "Accept": "application/json"
                }
            });
        } catch (err) {
            return {
                "content": '{"results": [],"total_results": 0}'
            };
        }
    },

    searchPersonMovie: function(id) {
        if (!Match.test(id, Match.Integer))
            return false;
        try {
            return Meteor.http.call("GET", "http://api.themoviedb.org/3/person/" + id + "/movie_credits?api_key=" + tmdb_api_key + "&page=1", {
                headers: {
                    "Accept": "application/json"
                }
            });
        } catch (err) {
            return {
                "content": '{"results": [],"total_results": 0}'
            };
        }
    },

    searchKeywords: function(keyword) {
        if (!Match.test(keyword, String))
            return false;
        try {
            return Meteor.http.call("GET", "http://api.themoviedb.org/3/search/keyword?api_key=" + tmdb_api_key + "&query=" + keyword + "&page=1", {
                headers: {
                    "Accept": "application/json"
                }
            });
        } catch (err) {
            return {
                "content": '{"results": [],"total_results": 0}'
            };
        }
    },

    searchMoviesFromKeyword: function(id) {
        if (!Match.test(id, Match.Integer))
            return false;
        try {
            return Meteor.http.call("GET", "http://api.themoviedb.org/3/keyword/" + id + "/movies?api_key=" + tmdb_api_key + "&page=1", {
                headers: {
                    "Accept": "application/json"
                }
            });
        } catch (err) {
            return {
                "content": '{"results": [],"total_results": 0}'
            };
        }
    },

    searchGenreMovies: function(id, page) {
        if (!Match.test(id, Match.Integer) && !Match.test(page, Match.Integer))
            return false;
        try {
            return Meteor.http.call("GET", "http://api.themoviedb.org/3/genre/" + id + "/movies?api_key=" + tmdb_api_key + "&page=" + page + "&include_adult=false&include_all_movies=false", {
                headers: {
                    "Accept": "application/json"
                }
            });
        } catch (err) {
            return {
                "content": '{"results": [],"total_results": 0}'
            };
        }
    },

    getMovie: function(id) {
        if (!Match.test(id, String))
            return false;
        try {
            return Meteor.http.call("GET", "http://api.themoviedb.org/3/movie/" + id + "?api_key=" + tmdb_api_key + "&page=1", {
                headers: {
                    "Accept": "application/json"
                }
            });
        } catch (err) {
            return {
                "content": '{"results": [],"total_results": 0}'
            };
        }
    },

    getMovieCredits: function(id) {
        if (!Match.test(id, String))
            return false;
        try {
            return Meteor.http.call("GET", "http://api.themoviedb.org/3/movie/" + id + "/credits?api_key=" + tmdb_api_key + "&page=1", {
                headers: {
                    "Accept": "application/json"
                }
            });
        } catch (err) {
            return {
                "content": '{"results": [],"total_results": 0}'
            };
        }
    },

    getTrailer: function(id) {
        if (!Match.test(id, String))
            return false;
        try {
            return Meteor.http.call("GET", "http://api.themoviedb.org/3/movie/" + id + "/videos?api_key=" + tmdb_api_key + "&page=1", {
                headers: {
                    "Accept": "application/json"
                }
            });
        } catch (err) {
            return {
                "content": '{"results": [],"total_results": 0}'
            };
        }
    },

    getSimilarMovies: function(id) {
        if (!Match.test(id, String))
            return false;
        try {
            return Meteor.http.call("GET", "http://api.themoviedb.org/3/movie/" + id + "/similar?api_key=" + tmdb_api_key + "&page=1", {
                headers: {
                    "Accept": "application/json"
                }
            });
        } catch (err) {
            return {
                "content": '{"results": [],"total_results": 0}'
            };
        }
    },

    getMovieImages: function(id) {
        if (!Match.test(id, String))
            return false;
        try {
            return Meteor.http.call("GET", "http://api.themoviedb.org/3/movie/" + id + "/images?api_key=" + tmdb_api_key + "", {
                headers: {
                    "Accept": "application/json"
                }
            });
        } catch (err) {
            return {
                "content": '{"results": [],"total_results": 0}'
            };
        }
    },

    searchMovies: function(search, page) {
        if (!Match.test(search, String) || !Match.test(page, Match.Integer))
            return false;
        try {
            var query = escape(search);
            return Meteor.http.call("GET", "http://api.themoviedb.org/3/search/movie?api_key=" + tmdb_api_key + "&query=" + query + "&page=" + page + "&include_adult=false", {
                headers: {
                    "Accept": "application/json"
                }
            });
        } catch (err) {
            return {
                "content": '{"results": [],"total_results": 0}'
            };
        }
    },

    getMovieReviewsFromTmdb: function(id) {
        if (!Match.test(id, String))
            return false;
        try {
            return Meteor.http.call("GET", "http://api.themoviedb.org/3/movie/" + id + "/reviews?api_key=" + tmdb_api_key + "", {
                headers: {
                    "Accept": "application/json"
                }

            });
        } catch (err) {
            return {
                "content": '{"results": [],"total_results": 0}'
            };
        }
    },

    getMovieReviewsFromMetacritic: function(title) {
        if (!Match.test(title, String))
            return false;
        try {
            return Meteor.http.call("GET", "https://byroredux-metacritic.p.mashape.com/reviews?url=http%3A%2F%2Fwww.metacritic.com%2Fmovie%2F" + title + "", {
                headers: {
                    "X-Mashape-Key": mashape_api_key,
                    "Accept": "application/json"
                }
            });
        } catch (err) {
            return {
                "content": '{"result": [],"count": 0}'
            };
        }
    },

    searchTweets: function(query) {
        if (!Match.test(query, String))
            return false;
        var tw = new Future();
        twit.get('search/tweets', {
            q: '#' + query,
            result_type: 'recent', // 'recent' or 'popular'
            count: 15,
            lang: 'en'
        }, function(err, data, response) {
            if (err) {
                tw.return({
                    "statuses": []
                });
            } else {
                tw.return(data);
            }
        });

        return tw.wait();
    }
});
