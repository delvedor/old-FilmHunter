/**
 * Load film results
 */
Template.resultsFilm.helpers({
    resultsPageFilm: function() {
        return Session.get('arrayResultFilm');
    }
});

/**
 * Load keyword results
 */
Template.resultsKeyword.helpers({
    resultsPageKeyword: function() {
        return Session.get('arrayResultKeyword');
    }
});

/**
 * Return the number of he analized results.
 */
Template.loading.helpers({
    totalResults: function() {
        return Session.get('numberOfResults');
    }
});

/**
 * Load the carusel of keyword.
 */
Template.resultsKeyword.rendered = function() {
    $(".owl-carousel").owlCarousel();
};