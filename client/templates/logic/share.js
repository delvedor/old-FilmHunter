Template.movieInfo.events({
    'click .facebookShare': function(e) {
        e.preventDefault();
        window.open("https://www.facebook.com/sharer.php?u=http://filmhunter.org" + window.location.pathname, "", "height=368,width=600,left=100,top=100,menubar=0");
        return false;
    },
    'click .twitterShare': function(e) {
        e.preventDefault();
        window.open("https://twitter.com/share?url=http://filmhunter.org" + window.location.pathname, "", "height=368,width=600,left=100,top=100,menubar=0");
        return false;
    },
    'click .googleplusShare': function(e) {
        e.preventDefault();
        window.open("https://plus.google.com/share?url=http://filmhunter.org" + window.location.pathname, "", "height=368,width=600,left=100,top=100,menubar=0");
        return false;
    }
});
