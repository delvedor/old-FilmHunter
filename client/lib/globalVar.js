/**
 * Global Variables
 */
movieHistory = [];
searchHistory = [];
pageHistory = ['/'];

Session.setDefault('searching', false);
Session.setDefault('genrePage', false);

dbResults = new Meteor.Collection(null);
dbMovieInfo = new Meteor.Collection(null);
Meteor.subscribe('genres');
Meteor.subscribe('favourites');
