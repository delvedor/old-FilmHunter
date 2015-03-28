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
    var captchaData = {
        captcha_challenge_id: Recaptcha.get_challenge(),
        captcha_solution: Recaptcha.get_response()
    };
    Meteor.call('saveBugReport', br, captchaData, function(err, result) {
        if (result)
            alert("Thank you for reporting bug.");
        if (err)
            alert("Error.");
        $('#textBugReport').val("");
    });
}
