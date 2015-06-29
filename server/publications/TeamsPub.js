Meteor.publish('Teams', function () {
  return Teams.find();
});

Meteor.publish('Team', function (code) {
    check(code, String);
    return Teams.find({code: code});
});

Meteor.publish('TickerTeams', function (tickerId, onlyPublic) {
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
        ret = Teams.find({_id: {$in: [ticker.teamHome, ticker.teamAway]}});
    }

    return ret;
});