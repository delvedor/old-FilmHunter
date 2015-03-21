/**
 * iron:router Config
 */

Router.route('/', function() {
    this.layout('layoutHome');
    this.render('home');
});

Router.route('/info', function() {
    this.layout('layout');
    this.render('info');
});

Router.route('/notfound', function() {
    this.layout('layout');
    this.render('notfound');
});