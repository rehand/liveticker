/**
 * Created by reini on 11.07.17.
 */
var mapVotings = function (formation, entries, votings, team) {
    if (votings && Array.isArray(votings)) {
        var kickers;
        if (team) {
            kickers = mapVotableKickers(formation, entries, !!team.coach, team.coach, team.coachObject[0]);
        } else {
            kickers = mapVotableKickers(formation, entries);
        }

        var maxVotingValueBarrier = Math.max.apply(Math, VOTING_VALUES) + 1;

        var votingsPerKicker = kickers.map(function (kicker) {
            var kickerResult = {
                kicker: kicker,
                votings: votings.map(function (userVoting) {
                    if (team && kicker.id == team.coach) {
                        return userVoting.coachVotings.find(function (voting) {
                            return voting.coachId == team.coach;
                        });
                    }

                    return userVoting.votings.find(function (voting) {
                        return voting.kickerId == kicker.id;
                    });
                }).filter(function (userVoting) {
                    return !!userVoting && userVoting.voting > 0;
                }).map(function (voting) {
                    return parseFloat(voting.voting);
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
            if (a.averageVoting === VOTING_VALUE_SKIP && b.averageVoting !== VOTING_VALUE_SKIP) {
                return maxVotingValueBarrier;
            } else if (b.averageVoting === VOTING_VALUE_SKIP && a.averageVoting !== VOTING_VALUE_SKIP) {
                return -maxVotingValueBarrier;
            }
            return a.averageVoting - b.averageVoting;
        });

        return votingsPerKicker;
    } else {
        return [];
    }
};

Template.tickerVotingsOverview.rendered = function () {
    $("button.copyTickerVotingsOverview").click((event) => {
        var targetId = $(event.currentTarget).attr("data-target-id");

        var entries = $("#" + targetId).find("table.votings tbody tr");

        var result = [];

        entries.each((index, entry) => {
            var columns = $(entry).find("td");
            var kicker = columns.get(0);
            var voting = columns.get(1);

            result.push(kicker.innerText + ":\t" + voting.innerText);
        });

        navigator.clipboard.writeText(result.join('\n'));
    });
};

Template.tickerVotingsOverview.helpers({
    mapVotings: function (formation, entries, votings) {
        return mapVotings(formation, entries, votings);
    },
    mapCoachVotings: function (entries, votings, team) {
        return mapVotings([], entries, votings, team);
    },
    getTeamAverage: function (votingsPerKicker) {
        if (!votingsPerKicker || votingsPerKicker.length < 1) {
            return "-";
        }

        var votingsSum = votingsPerKicker.reduce(function (result, currentVoting) {
            return result + currentVoting.averageVoting;
        }, 0);

        return Number(votingsSum / votingsPerKicker.length).toFixed(2);
    },
    getVotingsAverage: function (votingsPerKicker) {
        if (!votingsPerKicker || votingsPerKicker.length < 1) {
            return "-";
        }

        var votingsCount = votingsPerKicker.reduce(function (result, currentVoting) {
            return result + currentVoting.votings.length;
        }, 0);

        return Number(votingsCount / votingsPerKicker.length).toFixed(2);
    },
    formatAverage: function (average) {
        return Number(average).toFixed(2);
    }
});

Template.tickerVotingDetails.helpers({
    getVotableKickers: function (formation, entries, coachVoting, coachId, coach) {
        return mapVotableKickers(formation, entries, coachVoting, coachId, coach);
    },
    mapVotingDetails: function (formation, entries, votings, coachVoting, coachId, coach) {
        if (votings && Array.isArray(votings)) {
            var kickers = mapVotableKickers(formation, entries, coachVoting, coachId, coach);

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
                        if (kickerId == coachId && Array.isArray(userVoting.coachVotings)) {
                            return userVoting.coachVotings.find(function (voting) {
                                return voting.coachId == coachId;
                            });
                        }

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

Template.refereeVotingsOverview.helpers({
    mapRefereeVotings: function (votings, refereeId, refereeObject) {
        if (votings && Array.isArray(votings)) {
            var maxVotingValueBarrier = Math.max.apply(Math, VOTING_VALUES) + 1;
    
            var referees = {
                gamePosition: 'Schiedsrichter',
                id: refereeId,
                name: refereeObject.name
            };

            var votingsPerReferee = [referees].map(function (referee) {
                var refereeResult = {
                    kicker: referee,
                    votings: votings.map(function (userVoting) {
                        if (userVoting.refereeVoting) {
                            return [userVoting.refereeVoting].find(function (voting) {
                                return voting.refereeId == refereeId;
                            });
                        }
                        return [];
                    }).filter(function (userVoting) {
                        return !!userVoting && userVoting.voting > 0;
                    }).map(function (voting) {
                        return parseFloat(voting.voting);
                    }),
                    averageVoting: 0
                };
    
                if (refereeResult.votings.length > 0) {
                    refereeResult.averageVoting = Math.round((refereeResult.votings.reduce(function (a, b) {
                        return a + b;
                    }, 0) / refereeResult.votings.length) * 100) / 100;
                }
    
                return refereeResult;
            }).sort(function (a, b) {
                if (a.averageVoting === VOTING_VALUE_SKIP && b.averageVoting !== VOTING_VALUE_SKIP) {
                    return maxVotingValueBarrier;
                } else if (b.averageVoting === VOTING_VALUE_SKIP && a.averageVoting !== VOTING_VALUE_SKIP) {
                    return -maxVotingValueBarrier;
                }
                return a.averageVoting - b.averageVoting;
            });
    
            return votingsPerReferee;
        } else {
            return [];
        }
    }
});

Template.refereeVotingDetails.helpers({
    mapRefereeVotingDetails: function (refereeId, votings) {
        if (votings && Array.isArray(votings)) {
            var votingDetails = [];

            for(var idx in votings) {
                var userVoting = votings[idx];
                votingDetails.push({
                    ipAddress: userVoting.ipAddress,
                    timestamp: userVoting.timestamp,
                    votings: [refereeId].map(function (id) {
                        if (userVoting.refereeVoting && userVoting.refereeVoting.refereeId == refereeId) {
                            return userVoting.refereeVoting;
                        }
                        return {};
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