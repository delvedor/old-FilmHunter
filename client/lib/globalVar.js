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
