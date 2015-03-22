Template.layout.events({
    'click #backFaButton': function(e) {
        e.preventDefault();
        pageHistory.pop();
        Router.go(pageHistory[pageHistory.length - 1]);
    }
});

/**
 * Color Generator
 */
Template.layout.rendered = function() {
    var random = Math.floor(Math.random() * 3) + 1;
    var background, border, color;
    if (random === 1) {
        background = "background-red";
        border = "border-red";
        color = "color-red";
    } else if (random === 2) {
        background = "background-blue";
        border = "border-blue";
        color = "color-blue";
    } else {
        background = "background-green";
        border = "border-green";
        color = "color-green";
    }
    $('.nav-bar').addClass(background);
    $('.header').addClass(background);
    $('.border-search').addClass(border);
    $('#submitFilm').addClass(color);
};