/**
 * iron:router Config
 */

Router.configure({
    notFoundTemplate: "404"
});

Router.route('/', function() {
    pageHistory = ['/'];
    this.layout('layout');
    this.render('home');
});

Router.route('/help', function() {
    if (pageHistory[pageHistory.length - 1] !== 'help')
        pageHistory.push('help');
    this.layout('layout');
    this.render('help');
});

Router.route('/notfound', function() {
    if (pageHistory[pageHistory.length - 1] !== 'notfound')
        pageHistory.push('notfound');
    this.layout('layout');
    this.render('notfound');
});

Router.route('/bugReport', function() {
    if (pageHistory[pageHistory.length - 1] !== 'bugReport')
        pageHistory.push('bugReport');
    this.layout('layout');
    this.render('bugReport');
});

window.onpopstate = function() {
    if (Router.current().location.get().path !== pageHistory[pageHistory.length - 1] && pageHistory.length > 1)
        pageHistory.pop();
};
