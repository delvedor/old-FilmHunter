Template.layout.events({
    'click #backFaButton': function(e) {
        e.preventDefault();
        if (pageHistory.length === 1) {
            Router.go(_.last(pageHistory));
        } else {
            pageHistory.pop();
            Router.go(_.last(pageHistory));
        }

    },
    'click .sidePanelButton': function(e) {
        e.preventDefault();
        slidePanel.showPanel('sidePanel');
        $('.sidePanelButton').addClass('hide');
    },
    'click .close-panel': function() {
        $('.sidePanelButton').removeClass('hide');
    },
    'click .sidePanelEle': function() {
        slidePanel.closePanel();
        $('.sidePanelButton').removeClass('hide');
    }
});
