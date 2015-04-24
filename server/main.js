/*Meteor.startup(function() {
    favourites.find().forEach(function(doc) {
        favourites.update({
            "_id": doc._id
        }, {
            "$set": {
                "publicFav": true
            }
        });
    });
});*/

/*Meteor.publish("userData", function () {
    return Meteor.users.find({_id: this.userId},
        {fields: {'other': 1, 'things': 1}});
});*/

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
    user.profile.url = user.profile.name.replace(/\s/g, '').toLowerCase();
    do {
        others = Meteor.users.find({
            "profile.url": user.profile.url
        }).count();
        if (others !== 0)
            user.profile.url = user.profile.name.replace(/\s/g, '').toLowerCase() + '.' + (count++);
    } while (others !== 0);
    user.profile.image = "";
    user.profile.tagline = "";
    user.profile.publicFav = true;

    return user;
});
