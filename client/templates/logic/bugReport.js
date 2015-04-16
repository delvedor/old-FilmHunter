Template.bugReport.events({
    'click #sendBugReport': function(e) {
        e.preventDefault();
        br = $('#textBugReport').val().trim();
        if (br.replace(/\s/g, '') === "") {
            $('#textBugReport').val("");
            return;
        }
        if (br.length > 500)
            br = br.substring(0, 500);
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
