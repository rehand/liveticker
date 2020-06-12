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

Migrations.add({
        version: 5,
        name: 'Moved coach and referee into own collection',
        up: function () {
            console.log('Moving referess into own collection...');

            var tickers = Tickers.find({
                $and: [ {
                        'referee': {
                            $exists: true
                        }
                    }, {
                        'refereeObject': {
                            $exists: false
                        }
                    }
                ]
            }).fetch();

            console.log('Found ' + tickers.length + " tickers to check and migrate");

            tickers.forEach(function (ticker) {
                const tickerId = ticker._id;

                const referee = Referees.findOne({
                    name: ticker.referee
                });

                if (!referee) {
                    console.log('Creating refereee ' + ticker.referee);
                    Referees.insert({
                        name: ticker.referee
                    }, function(error, affectedRows) {
                        if (error) {
                            console.error('Error creating referee ' + ticker.referee);
                        } else {
                            const referee = Referees.findOne({
                                name: ticker.referee
                            });

                            if (referee) {
                                delete referee.createdAt;
                                Tickers.update(tickerId, {
                                    $set: {
                                        referee: referee._id,
                                        refereeObject: [referee]
                                    }
                                });

                                console.log('Updated ticker ' + tickerId);
                            } else {
                                console.error('Referee ' + ticker.referee + ' not found!');
                            }
                        }
                    });
                } else {
                    delete referee.createdAt;
                    Tickers.update(tickerId, {
                        $set: {
                            referee: referee._id,
                            refereeObject: [referee]
                        }
                    });

                    console.log('Updated ticker ' + tickerId);
                }
            });

            console.log('Done moving referees into own collection.');

            var teams = Teams.find({
                $and: [ {
                        'coach': {
                            $exists: true
                        }
                    }, {
                        'coachObject': {
                            $exists: false
                        }
                    }
                ]
            }).fetch();

            console.log('Found ' + teams.length + " teams to check and migrate");

            teams.forEach(function (team) {
                const teamId = team._id;

                const coach = Coaches.findOne({
                    name: team.coach
                });

                if (!coach) {
                    console.log('Creating coach ' + team.coach);
                    Coaches.insert({
                        name: team.coach
                    }, function(error, affectedRows) {
                        if (error) {
                            console.error('Error creating coach ' + team.coach);
                        } else {
                            const coach = Coaches.findOne({
                                name: team.coach
                            });

                            if (coach) {
                                delete coach.createdAt;
                                Teams.update(teamId, {
                                    $set: {
                                        coach: coach._id,
                                        coachObject: [coach]
                                    }
                                });

                                console.log('Updated team ' + teamId + ' (' + team.name + ')');
                            } else {
                                console.error('Coach ' + team.coach + ' not found!');
                            }
                        }
                    });
                } else {
                    delete coach.createdAt;
                    Teams.update(teamId, {
                        $set: {
                            coach: coach._id,
                            coachObject: [coach]
                        }
                    });

                    console.log('Updated team ' + teamId + ' (' + team.name + ')');
                }
            });

            console.log('Done moving coaches into own collection.');
        },
        down: function () {
            console.log('Removing coach objects from teams...');

            var teams = Teams.find({
                $and: [ {
                        'coach': {
                            $exists: true
                        }
                    }, {
                        'coachObject': {
                            $exists: true
                        }
                    }
                ]
            }).fetch();

            teams.forEach(function (team) {
                const teamId = team._id;

                Teams.update(teamId, {
                    $set: {
                        coach: team.coachObject[0].name
                    },
                    $unset: {
                        coachObject: true
                    }
                });

                console.log('Updated team ' + teamId + ' (' + team.name + ')');
            });

            var tickers = Tickers.find({
                $and: [ {
                        'referee': {
                            $exists: true
                        }
                    }, {
                        'refereeObject': {
                            $exists: true
                        }
                    }
                ]
            }).fetch();

            tickers.forEach(function (ticker) {
                const tickerId = ticker._id;

                Tickers.update(tickerId, {
                    $set: {
                        referee: ticker.refereeObject[0].name
                    },
                    $unset: {
                        refereeObject: true
                    }
                });

                console.log('Updated ticker ' + tickerId);
            });

            console.log('Deleting all referees');
            var refereesRemoved = Referees.remove({});
            console.log('Result (referees) ', refereesRemoved)

            console.log('Deleting all coaches');
            var coachesRemoved = Coaches.remove({});
            console.log('Result (coaches) ', coachesRemoved);
        }
    }
);

Migrations.add({
    version: 6,
    name: 'Added collection indexes',
    up: function () {
        console.log('Adding index published to Tickers');
        Tickers.rawCollection().createIndex({published: 1}, (error, result) => {
            if (error) {
                console.error('Error during creating index published on Tickers', error);
            } else {
                console.log('Created index published on Tickers:', result);
            }
        });

        console.log('Adding index published to Chats');
        Chats.rawCollection().createIndex({published: 1}, (error, result) => {
            if (error) {
                console.error('Error during creating index published on Chats', error);
            } else {
                console.log('Created index published on Chats:', result);
            }
        });

        console.log('Adding index code to Teams');
        Teams.rawCollection().createIndex({code: 1}, (error, result) => {
            if (error) {
                console.error('Error during creating index code on Teams', error);
            } else {
                console.log('Created index code on Teams:', result);
            }
        });

        console.log('Adding index id to TickerEntries');
        TickerEntries.rawCollection().createIndex({id: 1}, (error, result) => {
            if (error) {
                console.error('Error during creating index id on TickerEntries', error);
            } else {
                console.log('Created index id on TickerEntries:', result);
            }
        });

        console.log('Adding index tickerId to TickerEntries');
        TickerEntries.rawCollection().createIndex({tickerId: 1}, (error, result) => {
            if (error) {
                console.error('Error during creating index tickerId on TickerEntries', error);
            } else {
                console.log('Created index tickerId on TickerEntries:', result);
            }
        });

        console.log('Adding index id to ChatEntries');
        ChatEntries.rawCollection().createIndex({id: 1},  (error, result) => {
            if (error) {
                console.error('Error during creating index id on ChatEntries', error);
            } else {
                console.log('Created index id on ChatEntries:', result);
            }
        });

        console.log('Adding index chatId to ChatEntries');
        ChatEntries.rawCollection().createIndex({chatId: 1},  (error, result) => {
            if (error) {
                console.error('Error during creating index chatId on ChatEntries', error);
            } else {
                console.log('Created index chatId on ChatEntries:', result);
            }
        });

        console.log('Adding index state.tickerId to Presences');
        Presences.rawCollection().createIndex({'state.tickerId': 1},  (error, result) => {
            if (error) {
                console.error('Error during creating index state.tickerId on Presences', error);
            } else {
                console.log('Created index state.tickerId on Presences:', result);
            }
        });
    },
    down: function () {
        console.log('Removing index published from Tickers');
        Tickers.rawCollection().dropIndex({published: 1}, (error, result) => {
            if (error) {
                console.error('Error during removing index published from Tickers', error);
            } else {
                console.log('Removed index published from Tickers:', result);
            }
        });

        console.log('Removing index published from Chat');
        Chats.rawCollection().dropIndex({published: 1}, (error, result) => {
            if (error) {
                console.error('Error during removing index published from Chats', error);
            } else {
                console.log('Removed index published from Chats:', result);
            }
        });

        console.log('Removing index code from Teams');
        Teams.rawCollection().dropIndex({code: 1}, (error, result) => {
            if (error) {
                console.error('Error during removing index code from Teams', error);
            } else {
                console.log('Removed index code from Teams:', result);
            }
        });

        console.log('Removing index id from TickerEntries');
        TickerEntries.rawCollection().dropIndex({id: 1}, (error, result) => {
            if (error) {
                console.error('Error during removing index id from TickerEntries', error);
            } else {
                console.log('Removed index id from TickerEntries:', result);
            }
        });

        console.log('Removing index tickerId from TickerEntries');
        TickerEntries.rawCollection().dropIndex({tickerId: 1}, (error, result) => {
            if (error) {
                console.error('Error during removing index tickerId from TickerEntries', error);
            } else {
                console.log('Removed index tickerId from TickerEntries:', result);
            }
        });

        console.log('Removing index id from ChatEntries');
        ChatEntries.rawCollection().dropIndex({id: 1}, (error, result) => {
            if (error) {
                console.error('Error during removing index id from ChatEntries', error);
            } else {
                console.log('Removed index id from ChatEntries:', result);
            }
        });

        console.log('Removing index chatId from ChatEntries');
        ChatEntries.rawCollection().dropIndex({chatId: 1}, (error, result) => {
            if (error) {
                console.error('Error during removing index chatId from ChatEntries', error);
            } else {
                console.log('Removed index chatId from ChatEntries:', result);
            }
        });

        console.log('Removing index state.tickerId from Presences');
        Presences.rawCollection().dropIndex({'state.tickerId': 1}, (error, result) => {
            if (error) {
                console.error('Error during removing index state.tickerId from Presences', error);
            } else {
                console.log('Removed index state.tickerId from Presences:', result);
            }
        });
    }
});

Meteor.startup(function () {
    Migrations.migrateTo('latest');
});