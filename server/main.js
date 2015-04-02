Meteor.publish('genres', function() {
    return genres.find();
});
Meteor.publish('favourites', function() {
    return favourites.find({
        id: this.userId
    });
});

favourites.deny({
    insert: function() {
        return true;
    },
    update: function() {
        return true;
    },
    remove: function() {
        return true;
    }
});


genres.deny({
    insert: function() {
        return true;
    },
    update: function() {
        return true;
    },
    remove: function() {
        return true;
    }
});
