Meteor.publish('TeamLogo', function (teamId) {
    check(teamId, String);
    var team = Teams.findOne({code: teamId});
    return Images.find(team.logo);
});

Meteor.publish('Images', function () {
    return Images.find();
});

Meteor.publish('TickerImages', function (tickerId, onlyPublic) {
    check(tickerId, String);
    onlyPublic = !!onlyPublic;
    check(onlyPublic, Boolean);

    var filter = {
        _id: tickerId
    };

    if (onlyPublic) {
        filter.published = true;
    }

    var ticker = Tickers.findOne(filter);

    var ret = [];

    if (ticker) {
        var imageIds = Teams.find({_id: {$in: [ticker.teamHome, ticker.teamAway]}}).fetch().map(function (team) {
            return team.logo;
        });

        ret = Images.find({_id: {$in: imageIds}});
    }

    return ret;
});