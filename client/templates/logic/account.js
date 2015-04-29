var userInfo = new Blaze.ReactiveVar({});
var taglineCount = new Blaze.ReactiveVar(0);
var urlCount = new Blaze.ReactiveVar(0);
var showSettings = new Blaze.ReactiveVar(false);
var canUserUrl = new Blaze.ReactiveVar(true);
var timeoutCheckUrl;

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
        urlCount.set(userInfo.get().url.length);
        if (!showSettings.get()) {
            canUserUrl.set(true);
            var newTagline = $('#setTagline').val();
            var newUrl = $('#setUrl').val();
            if (newTagline.length > 500)
                newTagline = newTagline.substring(0, 500);
            if (userInfo.get().tagline !== newTagline) {
                userInfo.get().tagline = newTagline;
                Meteor.call('setTagline', Meteor.userId(), newTagline);
            }
            if (canUserUrl.get() && userInfo.get().url !== newUrl && newUrl.length > 2) {
                Meteor.call('setUrl', Meteor.userId(), newUrl);
                Router.go('/');
                Meteor.setTimeout(function() {
                    Router.go('/user/' + newUrl);
                }, 1000);

            }

        }

    },

    'click #toggleFav': function(e) {
        Meteor.call('toggleFav', Meteor.userId());
    },
    'keyup #setTagline': function(e) {
        if (e.type === "keyup") {
            e.preventDefault();

            var newTagline = $('#setTagline').val();
            newTagline = newTagline.replace(/[^a-zA-Z0-9_:\s-.,;:\/!?]/g, ''); // Avoid XSS
            $('#setTagline').val(newTagline);

            taglineCount.set(newTagline.length);
            if (taglineCount.get() > 499)
                $('#setTagline').val($('#setTagline').val().substring(0, 500));
        }
    },
    'keyup #setUrl': function(e) {
        if (e.type === "keyup") {
            Meteor.clearTimeout(timeoutCheckUrl);
            e.preventDefault();

            var newUrl = $('#setUrl').val();
            newUrl = newUrl.replace(/[^a-zA-Z0-9_:]/g, ''); // Avoid XSS
            $('#setUrl').val(newUrl);

            urlCount.set(newUrl.length);
            if (urlCount.get() > 50)
                $('#setUrl').val(newUrl.substring(0, 50));

            if (urlCount.get() < 3) {
                canUserUrl.set(false);
                return;
            }

            if (newUrl === Meteor.user().profile.url) {
                canUserUrl.set(true);
                return;
            }

            canUserUrl.set(false);
            timeoutCheckUrl = Meteor.setTimeout(function() {
                Meteor.call('checkUrl', Meteor.userId(), newUrl, function(err, result) {
                    canUserUrl.set(result);
                });
            }, 1000);

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
    urlCount: function() {
        return urlCount.get();
    },
    canUserUrl: function() {
        return canUserUrl.get();
    },
    publicFav: function() {
        if (Meteor.user())
            return userInfo.get().publicFav || Router.current().location.get().path === '/user/' + Meteor.user().profile.url;
        return userInfo.get().publicFav;
    }
});

loadAccount = function(result) {
    userInfo.set(result);
};

loadMyAccount = function() {
    var result = {
        name: "",
        image: "",
        url: "",
        tagline: "",
        publicFav: true
    };

    result.name = Meteor.user().profile.name;
    result.image = Meteor.user().profile.image;
    result.url = Meteor.user().profile.url;
    result.tagline = Meteor.user().profile.tagline;
    result.publicFav = Meteor.user().profile.publicFav;

    userInfo.set(result);
};
