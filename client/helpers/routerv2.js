/**
 * iron:router Config
 */

Router.configure({
    notFoundTemplate: "404"
});

Router.route('/', function() {
    this.layout('layout');
    this.render('home');
});

Router.route('/help', function() {
    if (_.last(pageHistory) !== 'help')
        pageHistory.push('help');
    this.layout('layout');
    this.render('help');
});

Router.route('/removeAccount', function() {
    if (Meteor.userId()) {
        if (_.last(pageHistory) !== 'removeAccount')
            pageHistory.push('removeAccount');
        this.layout('layout');
        this.render('removeAccount');
    } else {
        this.redirect('/');
    }
});

Router.route('/favourites', function() {
    if (_.last(pageHistory) !== 'favourites')
        pageHistory.push('favourites');
    this.layout('layout');
    this.render('favourites');
});

Router.route('/notfound', function() {
    if (_.last(pageHistory) !== 'notfound')
        pageHistory.push('notfound');
    this.layout('layout');
    this.render('notfound');
});

Router.route('/bugReport', function() {
    if (_.last(pageHistory) !== 'bugReport')
        pageHistory.push('bugReport');
    this.layout('layout');
    this.render('bugReport');
});

window.onpopstate = function() {
    if (Router.current().location.get().path !== _.last(pageHistory) && pageHistory.length > 1)
        pageHistory.pop();
};
