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

AccountsTemplates.configureRoute('signIn', {
    name: 'signin',
    path: '/signin',
    template: 'signin',
    layoutTemplate: 'layout',
    redirect: '/',
});

Router.route('/logout', {
    path: '/logout',
    onBeforeAction: function() {
        Meteor.logout();
        this.next();
    },
    action: function() {
        this.redirect('/');
    }
});

Router.route('/account', {
    path: '/account',
    action: function() {
        if (Meteor.user())
            this.redirect('/user/' + Meteor.user().profile.url);
        else
            this.redirect('signin');
    }
});

Router.route('/user', {
    path: '/user/:key',
    layout: 'account',
    layoutTemplate: 'layout',
    onBeforeAction: function() {
        this.render('loading');
        var t = this;
        var next = t.next();
        if (!Meteor.user() || '/user/' + this.params.key !== '/user/' + Meteor.user().profile.url) {
            Meteor.call('getUserBasic', this.params.key, function(err, result) {
                if (!result) {
                    t.redirect('usernotfound');
                } else {
                    loadAccount(result.profile);
                    loadFavourites(result.fav);
                    next;
                }
            });
        } else {
            loadMyAccount();
            loadMyFavourites();
            next;
        }
    },
    action: function() {
        if (pageHistory[pageHistory.length - 1] !== '/user/' + (this.params.key))
            pageHistory.push('/user/' + (this.params.key));
        this.render('account');

    }
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

Router.route('/usernotfound', function() {
    if (_.last(pageHistory) !== 'usernotfound')
        pageHistory.push('usernotfound');
    this.layout('layout');
    this.render('usernotfound');
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
