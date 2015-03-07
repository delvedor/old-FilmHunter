Meteor.methods({
    searchKeywords: function(keyword) {
        return Meteor.http.call("GET", "http://api.themoviedb.org/3/search/keyword?api_key=" + api_key + "&query=" + keyword + "&page=1");
    },

    searchMovies: function(id) {
        return Meteor.http.call("GET", "http://api.themoviedb.org/3/keyword/" + id + "/movies?api_key=" + api_key + "&page=1");
    },

    getMovie: function(id) {
        return Meteor.http.call("GET", "http://api.themoviedb.org/3/movie/" + id + "?api_key=" + api_key + "&page=1");
    },

    getTrailer: function(id) {
        return Meteor.http.call("GET", "http://api.themoviedb.org/3/movie/" + id + "/videos?api_key=" + api_key + "&page=1");
    },

    getSimilarMovies: function(id) {
        return Meteor.http.call("GET", "http://api.themoviedb.org/3/movie/" + id + "/similar?api_key=" + api_key + "&page=1");
    }
});