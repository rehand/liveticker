Migrations.add({
        version: 1,
        name: 'Moved ticker entries to separate collection.',
        up: function () {
            var tickers = Tickers.find().fetch();

            tickers.forEach(function (ticker) {
                var tickerId = ticker._id;
                console.log('Updating ticker ' + tickerId + ' with ' + (ticker.entries ? ticker.entries.length : 0) + ' entries');
                if (ticker.entries && ticker.entries.length > 0) {
                    ticker.entries.forEach(function (entry) {
                        if (entry.text && entry.text.length > 0) {
                            console.log('Moving entryId ' + entry.id + ' from ticker ' + tickerId);
                            entry.tickerId = tickerId;
                            TickerEntries.insert(entry);
                        } else {
                            console.log('Skipping entryId ' + entry.id + ' because it is empty');
                        }
                    });
                }

                console.log('Removing entries from ticker ' + tickerId);

                delete ticker.entries;
                Tickers.update(tickerId, {
                    $unset: {
                        entries: 1
                    }
                });
            });
        },
        down: function () {
            var tickerEntries = TickerEntries.find().fetch();

            tickerEntries.forEach(function (tickerEntry) {
                var tickerId = tickerEntry.tickerId;
                delete tickerEntry.tickerId;

                console.log('Adding entryId ' + tickerEntry.id + ' to ticker ' + tickerId);

                Tickers.update(tickerId, {
                    $push: {
                        entries: tickerEntry
                    }
                });

                console.log('Deleting entryId ' + tickerEntry.id);
                TickerEntries.remove({id: tickerEntry.id});
            });
        }
    }
);

var resultFunction = function (error, affectedRows) {
    console.log('Updated ' + affectedRows + ' entrie(s) with error: ' + error);
};

Migrations.add({
        version: 2,
        name: 'Added goalText and anthem to Team in database',
        up: function () {
            console.log('Setting goalText and anthem for team STU...');
            Teams.update({'code': 'STU'}, {
                $set: {
                    goalText: 'TOOOOOOOOOOOOOOOOOOOOOOOR',
                    anthem: 'sturm'
                }
            }, resultFunction);

            console.log('Setting goalText and anthem for team STUF...');
            Teams.update({'code': 'STUF'}, {
                $set: {
                    goalText: 'TOOOOOOOOOOOOOOOOOOOOOOOR',
                    anthem: 'sturm'
                }
            }, resultFunction);

            console.log('Setting goalText and anthem for team SVF...');
            Teams.update({'code': 'SVF'}, {
                $set: {
                    goalText: 'TOOOOOOOOOOOOOOOOOOOOOOOR',
                    anthem: 'steirermen'
                }
            }, resultFunction);
        },
        down: function () {
            console.log('Removing goalText and anthem from Teams...');
            Teams.update({}, {$unset: {
                goalText: "",
                anthem: ""
            }}, {multi: true}, resultFunction);
        }
    }
);

var swapVotingValuesForAllTickers = function() {
    var tickers = Tickers.find({'votings.0': {$exists: true}}).fetch();

    tickers.forEach(function (ticker) {
        var tickerId = ticker._id;
        console.log('Updating voting values for tickerId ' + tickerId);

        if (ticker.votings && ticker.votings.length > 0) {
            var votingsData = ticker.votings.map(function (votingData) {
                votingData.votings = votingData.votings.map(function (voting) {
                    if (!voting.voting) {
                        voting.voting = 0;
                    }
                    switch(voting.voting) {
                        case 1:
                            voting.voting = 5;
                            break;
                        case 2:
                            voting.voting = 4;
                            break;
                        case 4:
                            voting.voting = 2;
                            break;
                        case 5:
                            voting.voting = 1;
                            break;
                    }
                    return voting;
                });
                return votingData;
            });

            Tickers.update(tickerId, {
                $set: {
                    votings: votingsData
                }
            }, resultFunction);
            return false;
        }
    });
};

Migrations.add({
        version: 3,
        name: 'Changed voting values',
        up: function () {
            console.log('Migrating voting values...');
            swapVotingValuesForAllTickers();
        },
        down: function () {
            console.log('Migrating voting values back...');
            swapVotingValuesForAllTickers();
        }
    }
);

Migrations.add({
        version: 4,
        name: 'Moved team objects into ticker',
        up: function () {
            console.log('Copying team objects into ticker...');

            var tickers = Tickers.find({
                $or: [ {
                        'teamHomeObject': {
                            $exists: false
                        }
                    }, {
                        'teamAwayObject': {
                            $exists: false
                        }
                    }
                ]
            }).fetch();

            console.log('Found ' + tickers.length + " tickers to migrate");

            tickers.forEach(function (ticker) {
                var tickerId = ticker._id;
                console.log('Copying teams for tickerId ' + tickerId);

                var doUpdate = false;
                var updateData = {
                    $set: {}
                };

                if (ticker.teamHome && !ticker.teamHomeObject) {
                    var teamHome = Teams.findOne(ticker.teamHome);
                    if (teamHome) {
                        updateData.$set.teamHomeObject = [teamHome];
                        doUpdate = true;
                    }
                }

                if (ticker.teamAway && !ticker.teamAwayObject) {
                    var teamAway = Teams.findOne(ticker.teamAway);
                    if (teamAway) {
                        updateData.$set.teamAwayObject = [teamAway];
                        doUpdate = true;
                    }
                }

                if (doUpdate) {
                    Tickers.update(tickerId, updateData, resultFunction);
                }
            });

            console.log('Done copying team objects into ticker...');
        },
        down: function () {
            console.log('Removing team objects from ticker...');

            Tickers.update({}, {
                $unset: {
                    teamHomeObject: 1,
                    teamAwayObject: 1
                }
            }, {
                multi: true
            }, resultFunction);
        }
    }
);

Meteor.startup(function () {
    Migrations.migrateTo('latest');
});