/**
 * Global Variables
 */

movieHistory = [];
searchHistory = [];
Session.setDefault('searching', false);
Session.setDefault('numberOfResults', 0);
Session.setDefault('query', '');
dbResults = new Meteor.Collection(null);
dbMovieInfo = new Meteor.Collection(null);