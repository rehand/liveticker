var tickerFieldsExclude = {fields: {entries: 0, comments: 0, teamHomeFormation: 0, teamAwayFormation: 0}};

Meteor.publish('Tickers', function () {
    return Tickers.find({}, tickerFieldsExclude);
});

Meteor.publish('Ticker', function (_id, onlyPublic) {
    check(_id, String);
    onlyPublic = !!onlyPublic;
    check(onlyPublic, Boolean);

    var filter = {
        _id: _id
    };

    if (onlyPublic) {
        filter.published = true;
    }

    return Tickers.find(filter);
});

Meteor.publish('PublicTickers', function () {
    return Tickers.find({published: true}, tickerFieldsExclude);
});