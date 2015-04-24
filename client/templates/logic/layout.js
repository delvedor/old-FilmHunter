Template.layout.events({
    'click #backFaButton': function(e) {
        e.preventDefault();
        if (pageHistory.length !== 1)
            pageHistory.pop();
        Router.go(_.last(pageHistory));

    },
    'click #menuButton': function(e) {
        e.preventDefault();
        slidePanel.showPanel('sidePanel');
        $('#menuButton').addClass('hide');
        $('#userButton').addClass('hide');
    },
    'click .close-panel': function() {
        $('#menuButton').removeClass('hide');
        $('#userButton').removeClass('hide');
    },
    'click .sidePanelEle': function() {
        slidePanel.closePanel();
        $('#menuButton').removeClass('hide');
        $('#userButton').removeClass('hide');
    },
    'click #userButton': function(e) {
        if (Meteor.user())
            Router.go('/user/' + Meteor.user().profile.url);
        else
            Router.go('signin');
    }
});
