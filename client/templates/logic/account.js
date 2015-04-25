var userInfo = new Blaze.ReactiveVar({});
var taglineCount = new Blaze.ReactiveVar();
var showSettings = new Blaze.ReactiveVar(false);

Template.account.events({
    'click #removeAccount': function(e) {
        e.preventDefault();
        var username = prompt("Please, write your username: ");
        if (username !== null && username.replace(/\s/g, '').toLowerCase() === Meteor.user().profile.name.replace(/\s/g, '').toLowerCase()) {
            Meteor.call('removeAccount', Meteor.userId(), function(err, result) {
                if (result) {
                    alert("Done.");
                    Router.go('/');
                }
                if (err)
                    alert("Error.");
            });
        } else {
            alert("You have not written your username correctly.");
        }
    },
    'click #showSettings': function(e) {
        showSettings.set(!showSettings.get());
        taglineCount.set(userInfo.get().tagline.length);
        if (!showSettings.get()) {
            var tagline = $('#setTagline').val();
            if (tagline.length > 500)
                tagline = tagline.substring(0, 500);
            userInfo.set({
                image: userInfo.get().image,
                name: userInfo.get().name,
                publicFav: userInfo.get().publicFav,
                tagline: tagline
            });
            Meteor.call('setTagline', Meteor.userId(), tagline);
        }

    },

    'click #toggleFav': function(e) {
        Meteor.call('toggleFav', Meteor.userId());
    },
    'keyup #setTagline': function(e) {
        if (e.type === "keyup") {
            e.preventDefault();
            taglineCount.set($('#setTagline').val().length);
            if (taglineCount.get() > 499)
                $('#setTagline').val($('#setTagline').val().substring(0, 500));
        }
    }
});

Template.account.helpers({
    user: function() {
        return userInfo.get();
    },
    showSettings: function() {
        if (Meteor.user())
            return showSettings.get() && Router.current().location.get().path === '/user/' + Meteor.user().profile.url;
    },
    showSettingsButton: function() {
        if (Meteor.user())
            return Router.current().location.get().path === '/user/' + Meteor.user().profile.url;
    },
    checked: function() {
        if (Meteor.user().profile.publicFav)
            return "checked";
        return '';
    },
    taglineCount: function() {
        return taglineCount.get();
    },
    publicFav: function() {
        return userInfo.get().publicFav || Router.current().location.get().path === '/user/' + Meteor.user().profile.url;
    }
});

loadAccount = function(result) {
    if (Meteor.user() && Router.current().location.get().path === '/user/' + Meteor.user().profile.url)
        result.tagline = Meteor.user().profile.tagline;
    userInfo.set(result);

};
