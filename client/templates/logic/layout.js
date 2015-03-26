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

/**
 * Color Generator
 */
Template.layout.rendered = function() {
    var random = Math.floor(Math.random() * 3) + 1;
    var background, border, color, traspBackground;
    if (random === 1) {
        background = "background-red";
        border = "border-red";
        color = "color-red";
        traspBackground = "traspBackground-red";
    } else if (random === 2) {
        background = "background-blue";
        border = "border-blue";
        color = "color-blue";
        traspBackground = "traspBackground-blue";
    } else {
        background = "background-green";
        border = "border-green";
        color = "color-green";
        traspBackground = "traspBackground-green";
    }
    $('.nav-bar').addClass(background);
    $('.header').addClass(background);
    $('.border-search').addClass(border);
    $('#submitFilm').addClass(color);
    $('.slide-panel').addClass(traspBackground);
};
