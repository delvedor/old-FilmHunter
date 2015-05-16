/**
 * Global Variables
 */
movieHistory = [];
searchHistory = [];

Session.setDefault('searching', false);
Session.setDefault('genrePage', false);
Session.setDefault('currentSearch', "");

dbResults = new Meteor.Collection(null);
dbMovieInfo = new Meteor.Collection(null);
Meteor.subscribe('genres');
Meteor.subscribe('favourites');

console.log('Hi nerd, do you want to have more information about how this amazing application works?\nGo to https://github.com/delvedor/FilmHunter .');
