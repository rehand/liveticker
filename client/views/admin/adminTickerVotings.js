/**
 * Created by reini on 11.07.17.
 */
Template.tickerVotingsOverview.helpers({
    mapVotings: function (formation, entries, votings) {
        if (votings && Array.isArray(votings)) {
            var kickers = mapVotableKickers(formation, entries);

            var votingsPerKicker = kickers.map(function (kicker) {
                var kickerResult = {
                    kicker: kicker,
                    votings: votings.map(function (userVoting) {
                        return userVoting.votings.find(function (voting) {
                            return voting.kickerId == kicker.id;
                        });
                    }).filter(function (userVoting) {
                        return !!userVoting && userVoting.voting > 0;
                    }).map(function (voting) {
                        return voting.voting;
                    }),
                    averageVoting: 0
                };

                if (kickerResult.votings.length > 0) {
                    kickerResult.averageVoting = Math.round((kickerResult.votings.reduce(function (a, b) {
                                return a + b;
                            }, 0) / kickerResult.votings.length) * 100) / 100;
                }

                return kickerResult;
            }).sort(function (a, b) {
                return b.averageVoting - a.averageVoting;
            });

            return votingsPerKicker;
        } else {
            return [];
        }
    }
});

Template.tickerVotingDetails.helpers({
    getVotableKickers: function (formation, entries) {
        return mapVotableKickers(formation, entries);
    },
    mapVotingDetails: function (formation, entries, votings) {
        if (votings && Array.isArray(votings)) {
            var kickers = mapVotableKickers(formation, entries);

            var kickerIds = kickers.map(function (kicker) {
                return kicker.id;
            });

            var votingDetails = [];

            for(var idx in votings) {
                var userVoting = votings[idx];
                votingDetails.push({
                    ipAddress: userVoting.ipAddress,
                    timestamp: userVoting.timestamp,
                    votings: kickerIds.map(function (kickerId) {
                        return userVoting.votings.find(function (voting) {
                            return voting.kickerId == kickerId;
                        });
                    }).map(function (voting) {
                        if (!voting || !voting.voting) {
                            return 0;
                        }
                        return voting.voting;
                    })
                });
            }

            return votingDetails;
        } else {
            return [];
        }
    }
});