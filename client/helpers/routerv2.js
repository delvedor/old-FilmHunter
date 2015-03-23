/**
 * iron:router Config
 */

Router.route('/', function() {
    pageHistory = ['/'];
    this.layout('layoutHome');
    this.render('home');
});

Router.route('/info', function() {
    if (pageHistory[pageHistory.length - 1] !== 'info')
        pageHistory.push('info');
    this.layout('layout');
    this.render('info');
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
