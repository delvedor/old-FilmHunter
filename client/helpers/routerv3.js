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

Router.route('/account', function() {
    if (Meteor.userId()) {
        if (_.last(pageHistory) !== 'account')
            pageHistory.push('account');
        this.layout('layout');
        this.render('account');
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

Router.route('/search', {
    path: '/search/:key',
    layout: 'resultsFilm',
    layoutTemplate: 'layout',
    waitOn: function() {
        return Meteor.subscribe('genres');
    },
    onBeforeAction: function() {
        this.render('loadingRes');
        checkHistorySearch((this.params.key).replace(/[^a-zA-Z0-9_:]/g, '-'));
        if (!Session.get('searching'))
            this.next();
    },
    action: function() {
        if (pageHistory[pageHistory.length - 1] !== '/search/' + (this.params.key).replace(/[^a-zA-Z0-9_:]/g, '-'))
            pageHistory.push('/search/' + (this.params.key).replace(/[^a-zA-Z0-9_:]/g, '-'));
        this.render('resultsFilm');
    }
});

Router.route('/movie', {
    path: '/movie/:key',
    layout: 'movieInfo',
    layoutTemplate: 'layout',
    waitOn: function() {
        return Meteor.subscribe('genres');
    },
    onBeforeAction: function() {
        this.render('loading');
        checkHistoryMovie(escape(this.params.key));
        if (!Session.get('searching'))
            this.next();
    },
    action: function() {
        if (pageHistory[pageHistory.length - 1] !== '/movie/' + escape(this.params.key))
            pageHistory.push('/movie/' + escape(this.params.key));
        this.render('movieInfo');
    }
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
