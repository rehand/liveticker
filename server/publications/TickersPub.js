var tickerFieldsExclude = {fields: {comments: 0, teamHomeFormation: 0, teamAwayFormation: 0, updatedAt: 0, description: 0, descriptionTitle: 0, formationHidden: 0, scoreHome: 0, scoreAway: 0, createdAt: 0}};

Meteor.publish('Tickers', function () {
    return Tickers.find({}, tickerFieldsExclude);
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
    }

    return Tickers.find(filter, excludeFields);
});

Meteor.publish('PublicTickers', function () {
    return Tickers.find({published: true}, tickerFieldsExclude);
});

Meteor.publish('CurrentPublicTicker', function () {
    return Tickers.find({published: true}, {sort: {kickoff: -1}, limit: 1}, tickerFieldsExclude);
});

var tickerEntriesFieldsExclude = {fields: {tickerId: 0}};

Meteor.publish('TickerEntries', function (tickerId) {
    check(tickerId, String);

    return TickerEntries.find({
        tickerId: tickerId
    }, tickerEntriesFieldsExclude);
});