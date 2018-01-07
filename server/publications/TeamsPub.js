var teamFieldsExclude = {fields: {kickers: 0, logo: 0, createdAt: 0, updatedAt: 0}};
Meteor.publish('Teams', function () {
    return Teams.find({}, teamFieldsExclude);
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

        // if both teams are already deleted, publish a random team without any useful fields so that at least one Team object is available
        if (ret.count() === 0) {
            ret = Teams.find({}, {
                limit: 1,
                fields: {
                    createdAt: 1
                }
            });
        }
    }

    return ret;
});