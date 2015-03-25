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
    Meteor.call('saveBugReport', br, function(err, result) {
        if (result) {
            alert("Thank you for reporting bug.");
            $('#textBugReport').val("");
        }
        if (err)
            console.log(err);
    });
}