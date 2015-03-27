/**
 * Global Variables
 */

movieHistory = [];
searchHistory = [];
pageHistory = ['/'];

Session.setDefault('searching', false);
Session.setDefault('numberOfResults', 0);
dbResults = new Meteor.Collection(null);
dbMovieInfo = new Meteor.Collection(null);
