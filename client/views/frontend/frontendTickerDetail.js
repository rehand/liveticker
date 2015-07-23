var timer;

Template.frontendTickerDetail.created = function() {
    serverOffset = TimeSync.serverOffset();
    calcGameTime();
    timer = Meteor.setInterval(calcGameTime, 1000);
};

Template.frontendTickerDetail.destroyed = function() {
    Meteor.clearInterval(timer);
};