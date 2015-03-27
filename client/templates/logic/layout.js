Template.layout.events({
    'click #backFaButton': function(e) {
        e.preventDefault();
        pageHistory.pop();
        Router.go(pageHistory[pageHistory.length - 1]);
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
