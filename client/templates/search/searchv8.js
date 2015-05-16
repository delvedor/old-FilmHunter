/**
 * Variables Declaration
 */
var filmSearch = "";

/**
 * Check if the current research has already been performed.
 */
checkHistorySearch = function(params) {
    var bool = true;
    _.each(searchHistory, function(ele) {
        if (params === ele) {
            bool = false;
            loadHistory(params);
            return;
        }
    });
    if (bool)
        setSearch(params);
};

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
Template.layoutHome.events({
    'keyup #filmSearch': function(e) {
        keyupFilmSearch(e);
    },
    'click #goSearch': function(e) {
        clickFilmSearch(e);
    }
});

Template.layout.events({
    'keyup #filmSearch': function(e) {
        keyupFilmSearch(e);
    }
});

function keyupFilmSearch(e) {
    if (e.type === "keyup" && e.which === 13) {
        e.preventDefault();
        query = $('#filmSearch').val().trim();
        if (query.replace(/\s/g, '') === "") {
            $('#filmSearch').val("");
            return;
        }
        Router.go('/s=' + query.replace(/[^a-zA-Z0-9_:]/g, '-'));
    }
}

function clickFilmSearch(e) {
    e.preventDefault();
    query = $('#filmSearch').val().trim();
    if (query.replace(/\s/g, '') === "") {
        $('#filmSearch').val("");
        return;
    }
    Router.go('/s=' + query.replace(/[^a-zA-Z0-9_:]/g, '-'));
}

/**
 * Displays the list of movie genres if the user type g: in the search field.
 */
Template.layout.helpers({
    settingsInputSearch: autoCompleteConf('layout')
});
Template.layoutHome.helpers({
    settingsInputSearch: autoCompleteConf('layoutHome')
});

function autoCompleteConf(page) {
    var template;
    if (page === 'layoutHome')
        template = Template.dropdownHome;
    if (page === 'layout')
        template = Template.dropdown;

    return {
        position: "bottom",
        limit: 20,
        rules: [{
            token: 'g:',
            collection: genres,
            field: "name",
            matchAll: true,
            template: template
        }, {
            token: 'g: ',
            collection: genres,
            field: "name",
            matchAll: true,
            template: template
        }]
    };
}

function setSearch(query) {
    searchHistory.push(query);
    Session.set("searching", true);
    filmSearch = query.replace(/[-]/g, ' ');

    if (filmSearch.substring(0, 2) === "d:" || filmSearch.substring(0, 2) === "a:") {
        startSearchPerson(filmSearch);

    } else if (filmSearch.substring(0, 2) === "g:") {
        startSearchGenre(filmSearch, false);

    } else {
        startSearchMovie(filmSearch);
    }
}
