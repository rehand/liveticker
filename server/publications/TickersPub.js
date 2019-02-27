var tickerFieldsInclude = {
    fields: {
        kickoff: 1,
        teamHome: 1,
        "teamHomeObject.name": 1,
        teamAway: 1,
        "teamAwayObject.name": 1,
        published: 1
    }
}

Meteor.publish('Tickers', function () {
    return Tickers.find({}, tickerFieldsInclude);
});

Meteor.publish('Ticker', function (_id, onlyPublic, isFrontend) {
    check(_id, String);
    onlyPublic = !!onlyPublic;
    check(onlyPublic, Boolean);
    isFrontend = !!isFrontend;
    check(isFrontend, Boolean);

    var filter = {
        _id: _id
    };

    if (onlyPublic) {
        filter.published = true;
    }
    
    var excludeFields = {
        fields: {
            updatedAt: 0
        }
    };
    if (isFrontend) {
        excludeFields.fields.comments = 0;
        excludeFields.fields.votings = 0;
    }

    return Tickers.find(filter, excludeFields);
});

Meteor.publish('PublicTickers', function () {
    return Tickers.find({published: true}, tickerFieldsInclude);
});

Meteor.publish('CurrentPublicTicker', function () {
    return Tickers.find({published: true}, {sort: {kickoff: -1}, limit: 1}, tickerFieldsInclude);
});

var tickerEntriesFieldsExclude = {fields: {tickerId: 0}};

Meteor.publish('TickerEntries', function (tickerId) {
    check(tickerId, String);

    return TickerEntries.find({
        tickerId: tickerId
    }, tickerEntriesFieldsExclude);
});