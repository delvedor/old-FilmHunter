Template.bugReport.events({
    'click #sendBugReport': function(e) {
        e.preventDefault();
        br = $('#textBugReport').val().trim();
        if (br.replace(/\s/g, '') === "") {
            $('#textBugReport').val("");
            return;
        }
        sendBugReport(br);
    }
});

function sendBugReport(br) {
    Meteor.call('saveBugReport', br, Meteor.userId(), function(err, result) {
        if (result)
            alert("Thank you for reporting bug.");
        if (err)
            alert("Error.");
        $('#textBugReport').val("");
    });
}

Template.account.events({
    'click #removeAccount': function(e) {
        e.preventDefault();
        var username = prompt("Please, write your username: ");
        if (username !== null && username.replace(/\s/g, '').toLowerCase() === Meteor.user().profile.name.replace(/\s/g, '').toLowerCase()) {
            Meteor.call('removeAccount', Meteor.userId(), Meteor.userId(), function(err, result) {
                if (result)
                    alert("Done.");
                if (err)
                    alert("Error.");
            });
        }
    }
});
