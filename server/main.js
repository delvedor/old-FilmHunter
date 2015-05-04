Meteor.publish('genres', function() {
    return genres.find();
});
Meteor.publish('favourites', function() {
    return favourites.find({
        id: this.userId
    });
});

Meteor.users.deny({
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


Accounts.onCreateUser(function(options, user) {
    var count = 1;
    user.profile = {};
    user.profile = options.profile;
    if (user.profile.name.length === 0) {
        user.profile.name = "user";
    }
    user.profile.url = user.profile.name.replace(/\s/g, '').toLowerCase();
    do {
        others = Meteor.users.find({
            "profile.url": user.profile.url
        }).count();
        if (others !== 0)
            user.profile.url = user.profile.name.replace(/\s/g, '').toLowerCase() + '.' + (count++);
    } while (others !== 0);
    if (user.services.facebook)
        user.profile.image = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=large";
    if (user.services.google)
        user.profile.image = user.services.google.picture;
    if (user.services.twitter)
        user.profile.image = user.services.twitter.profile_image_url.substring(0, user.services.twitter.profile_image_url.length - 7);
    user.profile.tagline = "";
    user.profile.publicFav = true;

    return user;
});
