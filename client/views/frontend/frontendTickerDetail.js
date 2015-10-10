var timer;

Template.frontendTickerDetail.created = function () {
    serverOffset = TimeSync.serverOffset();
    calcGameTime();
    timer = Meteor.setInterval(calcGameTime, 1000);

    Session.setDefault(SESSION_PLAY_AUDIO, true);
};

Template.frontendTickerDetail.rendered = function () {
    setTimeout(function () {
        $("#matchInfo").sticky({topSpacing: 0, className: 'sticky', getWidthFrom: '#errors', responsiveWidth: true});
        $("#matchInfo").sticky('update');
    }, 2000);
};

Template.frontendTickerDetail.destroyed = function () {
    Meteor.clearInterval(timer);
};