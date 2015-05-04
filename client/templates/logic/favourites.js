var userFav = new Blaze.ReactiveVar([{}]);

Template.movieInfo.events({
    'click .fa-heart': function(e) {
        e.preventDefault();
        var userId = Meteor.userId();
        if (userId)
            addFavourites(userId);
        else
            Router.go('signin');
    }
});

/**
 * Get the click event on a film result and redirect to the dynamic movieInfo page.
 */
Template.favourites.events({
    'click .filmResult-col': function(e) {
        e.preventDefault();
        Router.go('/movie/' + e.currentTarget.id);
    }
});

function addFavourites(userId) {
    var favLen = favourites.find({
        id: userId
    }).fetch();
    if (favLen.length === 0) {
        Meteor.call('createFavourites', userId);
    }
    var movie = dbMovieInfo.findOne({}, {
        sort: {
            ts: -1
        }
    }).movieInfo;
    var exist = favourites.find({
        "fav.id": movie.id
    }).fetch();
    if (exist.length === 0) {
        Meteor.call('addFavourites', userId, {
            id: movie.id,
            title: movie.title,
            image: movie.image,
            order: (parseInt(movie.release_date.replace(/[-]/g, ''), 10) % 2 === 0 ? 'big' : 'small')
        });
    } else {
        Meteor.call('removeFavourites', userId, {
            id: movie.id
        });
    }
}

/**
 * Helper for rective data of the related movie.
 */
Template.favourites.helpers({
    favourites: function() {
        Meteor.setTimeout(setGrid, 100);
        return userFav.get();
    }
});

loadFavourites = function(result) {
    result = _.sortBy(result, function(ele) {
        return ele.title;
    });

    userFav.set(result);
};

loadMyFavourites = function() {
    if (!favourites.findOne())
        result = [];
    else
        result = favourites.findOne().fav;

    userFav.set(result);
};

/**
 * Corrects the height of the div standard
 */
function setGrid() {
    var container = document.querySelector('.resultsGrid');
    var iso = new Isotope(container, {
        itemSelector: '.colElement-results',
        masonry: {
            isFitWidth: true
        }
    });
}
