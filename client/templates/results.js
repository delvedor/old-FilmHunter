/* Load film results */
Template.resultsFilm.helpers({
    resultsPageFilm: function() {
        return Session.get('arrayResultFilm');
    }
});

/* Load keyword results*/
/*Template.resultsKeyword.helpers({
    resultsPageKeyword: function () {
        return Session.get('arrayResultKeyboard');
    }
});*/