var userInfo = new Blaze.ReactiveVar({});

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
        Session.set('showSettings', !Session.get('showSettings'));
        if (Session.get('showSettings')) {
            $('#showSettings').text('Close Settings');
        } else {
            Meteor.call('setTagline', Meteor.userId(), $('#setTagline').val());
            $('#showSettings').text('Show Settings');
        }
    },
    'click #toggleFav': function(e) {
        Meteor.call('toggleFav', Meteor.userId());
    }
});

Template.account.helpers({
    user: function() {
        return userInfo.get();
    },
    showSettings: function() {
        if (Meteor.user())
            return Session.get('showSettings') && Router.current().location.get().path === '/user/' + Meteor.user().profile.url;
    },
    showSettingsButton: function() {
        if (Meteor.user())
            return Router.current().location.get().path === '/user/' + Meteor.user().profile.url;
    },
    checked: function() {
        if (Meteor.user().profile.publicFav) {
            return {
                checked: "checked"
            };
        }
        return '';
    }
});

loadAccount = function(result) {
    if (Meteor.user() && Router.current().location.get().path === '/user/' + Meteor.user().profile.url)
        result.tagline = Meteor.user().profile.tagline;
    userInfo.set(result);

};
