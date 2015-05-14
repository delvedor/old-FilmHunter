var layoutEvents = {
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
            Router.go('/' + Meteor.user().profile.url);
        else
            Router.go('signin');
    }
};

Template.layout.events(layoutEvents);
Template.layoutHome.events(layoutEvents);
Template.layout.helpers({
    'currentSearch': function() {
        return Session.get('currentSearch');
    }
});
