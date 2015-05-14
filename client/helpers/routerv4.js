/**
 * iron:router Config
 */

Router.route('/', function() {
    this.layout('layoutHome');
    this.render('home');
});

Router.route('/help', function() {
    this.layout('layout');
    this.render('help');
});

Router.route('/signin', function() {
    this.layout('layout');
    this.render('signin');
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
            this.redirect('/' + Meteor.user().profile.url);
        else
            this.redirect('signin');
    }
});

Router.route('/s=', {
    path: '/s=:key',
    layout: 'resultsFilm',
    layoutTemplate: 'layout',
    onBeforeAction: function() {
        this.render('loading');
        Session.set('currentSearch', (this.params.key).replace(/[-]/g, ' '));
        checkHistorySearch((this.params.key).replace(/[^a-zA-Z0-9_:]/g, '-'));
        if (!Session.get('searching'))
            this.next();
    },
    action: function() {
        this.render('resultsFilm');
    }
});

Router.route('/m=', {
    path: '/m=:key',
    layout: 'movieInfo',
    layoutTemplate: 'layout',
    onBeforeAction: function() {
        this.render('loading');
        checkHistoryMovie(escape(this.params.key));
        this.next();
    },
    action: function() {
        if (!Session.get('searching'))
            this.render('movieInfo');
    }
});

Router.route('/notfound', function() {
    this.layout('layout');
    this.render('404');
});

Router.route('/bugReport', function() {
    this.layout('layout');
    this.render('bugReport');
});

Router.route('/', {
    path: '/:user',
    layout: 'account',
    layoutTemplate: 'layout',
    onBeforeAction: function() {
        this.render('loading');
        var t = this;
        var next = t.next();
        if (!Meteor.user() || this.params.user !== Meteor.user().profile.url) {
            Meteor.call('getUserBasic', this.params.user, function(err, result) {
                if (!result) {
                    t.redirect('notfound');
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
        this.render('account');
    }
});
