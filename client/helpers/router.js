/**
 * iron:router Config
 */

Router.route('/', function() {
    this.layout('layoutHome');
    this.render('home');
});

Router.route('/search', function() {
    this.layout('layout');
    this.render('resultsFilm');
});

Router.route('/loading', function() {
    this.layout('layout');
    if (Session.get("searching") == true) {
        this.render('loading');
    } else {
        Router.go('search');
    }

});

Router.route('/movieInfo', function() {
    this.layout('layout');
    this.render('movieInfo');
});

Router.route('/info', function() {
    this.layout('layout');
    this.render('info');
});

Router.route('/notfound', function() {
    this.layout('layout');
    this.render('notfound');
});