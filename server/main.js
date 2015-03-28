Meteor.publish('genres', function() {
    return genres.find();
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
