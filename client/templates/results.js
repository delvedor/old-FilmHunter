/* Load film results */
Template.resultsFilm.helpers({
    resultsPageFilm: function() {
        return Session.get('arrayResultFilm');
    }
});

/* Load keyword results*/
Template.resultsKeyword.helpers({
    resultsPageKeyword: function() {
        //$(".owl-carousel").owlCarousel();
        return Session.get('arrayResultKeyword');
    }
});

Template.resultsKeyword.rendered = function() {
    $(".owl-carousel").owlCarousel();
};