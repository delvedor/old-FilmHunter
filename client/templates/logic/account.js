Template.account.events({
    'click #signout': function(e) {
        e.preventDefault();
        Meteor.logout();
    },

    'click #removeAccount': function(e) {
        e.preventDefault();
        var username = prompt("Please, write your username: ");
        if (username !== null && username.replace(/\s/g, '').toLowerCase() === Meteor.user().profile.name.replace(/\s/g, '').toLowerCase()) {
            Meteor.call('removeAccount', Meteor.userId(), function(err, result) {
                if (result)
                    alert("Done.");
                if (err)
                    alert("Error.");
            });
        }
    }
});

Template.account.helpers({
    username: function() {
        return Meteor.user().profile.name;
    }
});
