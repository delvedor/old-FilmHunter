/**
 * Variables Declaration
 */
var filmSearch = "";

/**
 * Load the routegetting the parameters in the url.
 */
Router.route('/search', {
    path: '/search/:key',
    layout: 'resultsFilm',
    layoutTemplate: 'layout',
    onBeforeAction: function() {
        this.render('loadingRes');
        checkHistory((this.params.key).replace(/[^a-zA-Z0-9_:]/g, '-'));
        if (!Session.get('searching'))
            this.next();
    },
    action: function() {
        if (pageHistory[pageHistory.length - 1] !== '/search/' + (this.params.key).replace(/[^a-zA-Z0-9_:]/g, '-'))
            pageHistory.push('/search/' + (this.params.key).replace(/[^a-zA-Z0-9_:]/g, '-'));
        this.render('resultsFilm');
    }
});

/**
 * Check if the current research has already been performed.
 */
function checkHistory(params) {
    for (var i = 0, sHlen = searchHistory.length; i < sHlen; ++i) {
        if (params === searchHistory[i]) {
            loadHistory(params);
            return;
        }
    }
    setSearch(params);
}

/**
 * If the current research has already been performed, then it loads the data.
 */
function loadHistory(params) {
    dbResults.update({
        search: params
    }, {
        $unset: {
            ts: ""
        },
        $set: {
            ts: new Date()
        }
    });
}

/**
 * Home Template Events
 */
Template.layout.events({
    'keyup #filmSearch': function(e) {
        if (e.type === "keyup" && e.which === 13) {
            e.preventDefault();
            query = $('#filmSearch').val().trim();
            if (query.replace(/\s/g, '') === "") {
                $('#filmSearch').val("");
                return;
            }
            Router.go('/search/' + query.replace(/[^a-zA-Z0-9_:]/g, '-'));
        }
    },
    'click #goSearch': function(e) {
        e.preventDefault();
        query = $('#filmSearch').val().trim();
        if (query.replace(/\s/g, '') === "") {
            $('#filmSearch').val("");
            return;
        }
        Router.go('/search/' + query.replace(/[^a-zA-Z0-9_:]/g, '-'));
    }
});

/**
 * Displays the list of movie genres if the user type g: in the search field.
 */
Template.layout.helpers({
    settings: function() {
        return {
            position: "bottom",
            limit: 20,
            rules: [{
                token: 'g:',
                collection: genres,
                field: "name",
                matchAll: true,
                template: Template.dropdown
            }, {
                token: 'g: ',
                collection: genres,
                field: "name",
                matchAll: true,
                template: Template.dropdown
            }]
        };
    }
});

function setSearch(query) {
    searchHistory.push(query);
    Session.set("searching", true);
    filmSearch = query.replace(/[-]/g, ' ');

    if (filmSearch.substring(0, 2) === "d:" || filmSearch.substring(0, 2) === "a:") {
        startSearchPerson(filmSearch);

    } else if (filmSearch.substring(0, 2) === "g:") {
        startSearchGenre(filmSearch);

    } else {
        startSearchMovie(filmSearch);
    }
}
