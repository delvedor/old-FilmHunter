var bugReportCount = new Blaze.ReactiveVar(0);

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
    },
    'keyup #textBugReport': function(e) {
        if (e.type === "keyup") {
            e.preventDefault();
            bugReportCount.set($('#textBugReport').val().length);
            if (bugReportCount.get() > 499)
                $('#textBugReport').val($('#textBugReport').val().substring(0, 500));
        }
    }
});

Template.bugReport.helpers({
    bugReportCount: function() {
        return bugReportCount.get();
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
