Tickers = new Mongo.Collection('Tickers');
TickerEntries = new Mongo.Collection('TickerEntries');

var teamsOptionMapper = function () {
    return Teams.find({}, {sort: {name: 1}}).map(function (team) {
        return {label: team.name + " (" + team.code + ")", value: team._id};
    });
};

KickerVotingSchema = new SimpleSchema({
    'kickerId': {
        type: String
    },
    'voting': {
        type: Number,
        label: 'Bewertung',
        allowedValues: VOTING_VALUES
    }
});

VotingSchema = new SimpleSchema({
    votings: {
        type: [KickerVotingSchema],
        label: 'Bewertungen'
    },
    ipAddress: {
        type: String
    },
    timestamp: {
        type: Date,
        optional: true,
        autoValue: function () {
            if (!this.isSet && this.operator !== "$pull" && this.isInsert) {
                return new Date();
            }
        }
    }
});

KickersFormationSchema = new SimpleSchema({
    id: {
        type: String,
        autoform: {
            type: "hidden",
            label: false,
            readonly: true
        },
        optional: true,
        autoValue: function () {
            if (!this.isSet) {
                return new Mongo.Collection.ObjectID()._str;
            }
        }
    },
    gamePosition: {
        type: String,
        label: 'Spielposition',
        allowedValues: POSITIONS.concat(POS_ERSATZBANK, POS_NA),
        defaultValue: POS_NA
    },
    position: {
        type: String,
        label: 'Hauptposition',
        allowedValues: POSITIONS,
        autoform: {
            readonly: true
        }
    },
    name: {
        type: String,
        label: 'Name'
    },
    number: {
        type: Number,
        label: 'Rückennummer',
        optional: true
    },
    isCaptain: {
        type: Boolean,
        label: 'Kapitän',
        defaultValue: false,
        autoform: {
            afFieldInput: {
                type: "boolean-checkbox",
                trueLabel: "Ja",
                falseLabel: "Nein"
            },
            template: 'materialized'
        }
    }
});

TickerEntriesSchema = new SimpleSchema({
    id: {
        type: String,
        autoform: {
            type: "hidden",
            label: false,
            readonly: true
        },
        optional: true,
        autoValue: function () {
            if (!this.isSet && this.isInsert) {
                return new Mongo.Collection.ObjectID()._str;
            }
        }
    },
    timestamp: {
        type: Date,
        label: 'Minute',
        optional: true,
        autoValue: function () {
            if (!this.isSet && this.operator !== "$pull" && this.isInsert) {
                return new Date();
            }
        }
    },
    text: {
        type: String,
        label: 'Text'
    },
    eventType: {
        type: String,
        allowedValues: ALL_EVENT_TYPES,
        defaultValue: EVENT_TYPE_TEXT
    },
    kicker: {
        type: [KickersFormationSchema],
        optional: true
    },
    teamId: {
        type: String,
        optional: true
    },
    tickerId: {
        type: String
    }
});

TickerEntries.attachSchema(TickerEntriesSchema);

TickerComments = new SimpleSchema({
    id: {
        type: String,
        autoform: {
            type: "hidden",
            label: false,
            readonly: true
        },
        optional: true,
        autoValue: function () {
            if (!this.isSet) {
                return new Mongo.Collection.ObjectID()._str;
            }
        }
    },
    timestamp: {
        type: Date,
        optional: true,
        autoValue: function () {
            if (!this.isSet && this.operator !== "$pull") {
                return new Date();
            }
        }
    },
    name: {
        type: String,
        label: 'Name'
    },
    text: {
        type: String,
        label: 'Text'
    },
    approved: {
        type: Boolean,
        defaultValue: false
    },
    tickerId: {
        type: String,
        optional: true
    }
});

EventSchema = new SimpleSchema({
    eventType: {
        type: String,
        allowedValues: ALL_EVENT_TYPES,
        label: 'Eventtyp'
    },
    kicker: {
        type: String,
        label: 'Spieler'
    },
    kicker2: {
        type: String,
        optional: true
    },
    teamId: {
        type: String,
        label: 'Mannschaft'
    },
    tickerId: {
        type: String
    }
});

SubstitutionEventSchema = new SimpleSchema([EventSchema, {
    kicker2: {
        type: String,
        optional: false
    }
}]);

Tickers.attachSchema(
    new SimpleSchema({
        teamHome: {
            type: String,
            label: 'Heimmannschaft',
            autoform: {
                options: teamsOptionMapper
            }
        },
        teamAway: {
            type: String,
            label: 'Auswärtsmannschaft',
            autoform: {
                options: teamsOptionMapper
            }
        },
        published: {
            type: Boolean,
            defaultValue: false,
            label: 'Veröffentlicht'
        },
        kickoff: {
            type: Date,
            optional: false,
            label: 'Spieltermin'
        },
        referee: {
            type: String,
            optional: true,
            label: 'Schiedsrichter'
        },
        competition: {
            type: String,
            optional: true,
            label: 'Bewerb'
        },
        descriptionTitle: {
            type: String,
            optional: true,
            label: 'Titel Zusatzinformationen',
            defaultValue: 'Einstimmung'
        },
        description: {
            type: String,
            optional: true,
            label: 'Zusatzinformationen',
            defaultValue: '<iframe width="420" height="315" src="https://www.youtube.com/embed/brLRjzqrazU?rel=0&amp;'
                            + 'showinfo=0" frameborder="0" allowfullscreen></iframe><br/><a target="_blank" '
                            + 'href="https://www.youtube.com/watch?v=brLRjzqrazU">Gruabn Song - Video von Alex Rehak</a>',
            autoform: {
                rows: 10
            }
        },
        scoreHome: {
            type: Number,
            optional: true,
            defaultValue: 0,
            min: 0
        },
        scoreAway: {
            type: Number,
            optional: true,
            defaultValue: 0,
            min: 0
        },
        timeFirstHalfStart: {
            type: Date,
            label: 'Beginn 1. Halbzeit',
            optional: true
        },
        timeFirstHalfEnd: {
            type: Date,
            label: 'Ende 1. Halbzeit',
            optional: true
        },
        timeSecondHalfStart: {
            type: Date,
            label: 'Beginn 2. Halbzeit',
            optional: true
        },
        timeSecondHalfEnd: {
            type: Date,
            label: 'Ende 2. Halbzeit',
            optional: true
        },
        createdAt: {
            type: Date,
            autoValue: function () {
                if (this.isInsert) {
                    return new Date();
                }
            },
            denyUpdate: true,
            optional: true
        },
        updatedAt: {
            type: Date,
            autoValue: function() {
                if (this.isUpdate) {
                    return new Date();
                }
            },
            optional: true
        },
        entries: {
            type: [TickerEntriesSchema],
            defaultValue: [],
            optional: true
        },
        comments: {
            type: [TickerComments],
            defaultValue: [],
            optional: true
        },
        teamHomeFormation: {
            type: [KickersFormationSchema],
            defaultValue: [],
            label: 'Aufstellung Heimmannschaft',
            optional: true
        },
        teamAwayFormation: {
            type: [KickersFormationSchema],
            defaultValue: [],
            label: 'Aufstellung Auswärtsmannschaft',
            optional: true
        },
        formationHidden: {
            type: Boolean,
            defaultValue: false,
            optional: true,
            label: 'Sichtbarkeit',
            autoform: {
                afFieldInput: {
                    type: "boolean-select",
                    trueLabel: "Ausblenden",
                    falseLabel: "Freigeben"
                }
            }
        },
        votingEnabled: {
            type: Boolean,
            defaultValue: false,
            optional: true,
            label: 'Spielerbewertung',
            autoform: {
                afFieldInput: {
                    type: "boolean-select",
                    trueLabel: "Freigeben",
                    falseLabel: "Sperren"
                }
            }
        },
        votingDeadline: {
            type: Date,
            optional: true,
            label: 'Spielerbewertung geöffnet bis'
        },
        teamHomeVoting: {
            type: Boolean,
            defaultValue: false,
            label: 'Spielerbewertung Heimmannschaft',
            optional: true
        },
        teamAwayVoting: {
            type: Boolean,
            defaultValue: false,
            label: 'Spielerbewertung Auswärtsmannschaft',
            optional: true
        },
        votings: {
            type: [VotingSchema],
            defaultValue: [],
            optional: true,
            autoform: {
                type: "hidden",
                label: false
            }
        }
    })
);

VotingFormSchema = new SimpleSchema({
    tickerId: {
        type: String
    },
    votingEnabled: {
        type: Boolean,
        label: 'Spielerbewertung',
        autoform: {
            afFieldInput: {
                type: "boolean-select",
                trueLabel: "Freigegeben",
                falseLabel: "Gesperrt"
            }
        }
    },
    votingDeadline: {
        type: Date,
        optional: true,
        label: 'Spielerbewertung geöffnet bis'
    },
    teamIds: {
        type: [String],
        label: 'Mannschaften auswählen:'
    }
});

Tickers.helpers({
    getHomeTeam: function() {
        return Teams.findOne(this.teamHome);
    },
    getAwayTeam: function() {
        return Teams.findOne(this.teamAway);
    },
    countHomeFormation: function () {
        if (this.teamHomeFormation) {
            return Object.keys(this.teamHomeFormation).length;
        }
        return 0;
    },
    countAwayFormation: function () {
        if (this.teamAwayFormation) {
            return Object.keys(this.teamAwayFormation).length;
        }
        return 0;
    },
    isVotingEnabled: function () {
        return this.votingEnabled && this.votingDeadline && Date.now() < this.votingDeadline;
    }
});

if (Meteor.isServer) {
    function isGoalEvent(event) {
        return event.eventType === EVENT_TYPE_GOAL || event.eventType === EVENT_TYPE_PENALTY_GOAL || event.eventType === EVENT_TYPE_OWN_GOAL;
    }

    function findKickerById(kickers, kickerId) {
        for (var i = 0; i < kickers.length; i++) {
            if (kickers[i].id == kickerId) {
                return kickers[i];
            }
        }
        return undefined;
    }

    function getChangeScoreUpdateValue(value, isHomeScore) {
        if (Math.abs(value) != 1) {
            throw new Meteor.Error("ticker-changeScore", "Score kann nicht um " + value + " verändert werden!");
        }

        var inc = {};
        inc[isHomeScore ? 'scoreHome' : 'scoreAway'] = value;
        return inc;
    }

    function cleanFormation (formation) {
        return formation.filter(function (formation) {
            return formation !== null;
        });
    }

    Tickers.allow({
        insert: function () {
            return true;
        },
        update: function () {
            return true;
        },
        remove: function () {
            return true;
        }
    });

    TickerEntries.allow({
        insert: function () {
            return true;
        },
        update: function () {
            return true;
        },
        remove: function () {
            return true;
        }
    });

    Meteor.methods({
        addTicker: function (ticker) {
            if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }

            check(ticker, Tickers.simpleSchema());

            var teamHome = Teams.findOne(ticker.teamHome);
            var teamAway = Teams.findOne(ticker.teamAway);

            if (!teamHome || !teamAway) {
                throw new Meteor.Error("team-not-found", "Team nicht gefunden!");
            }

            var setPositionNotDefined = function (kicker) {
                kicker.gameposition = POS_NA;
                return kicker;
            };

            if (Array.isArray(teamHome.kickers)) {
                ticker.teamHomeFormation = teamHome.kickers.map(setPositionNotDefined);
            } else {
                ticker.teamHomeFormation = [];
            }

            if (Array.isArray(teamAway.kickers)) {
                ticker.teamAwayFormation = teamAway.kickers.map(setPositionNotDefined);
            } else {
                ticker.teamAwayFormation = [];
            }

            Tickers.insert(ticker);

            var redirect = {
                template: 'adminTickers'
            };

            return redirect;
        },
        addEvent: function (data) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(data, Object);

            var tickerId = data.tickerId;
            check(tickerId, String);

            var ticker = Tickers.findOne(tickerId);
            if (ticker === null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            }

            var teamId = data.teamId;

            var kicker = [], isHomeScore = false;
            if (data.kicker !== KICKER_ID_DUMMY) {
                if (ticker.teamHome == teamId) {
                    kicker = [findKickerById(ticker.teamHomeFormation, data.kicker)];
                    isHomeScore = true;
                } else if (ticker.teamAway == teamId) {
                    kicker = [findKickerById(ticker.teamAwayFormation, data.kicker)];
                } else {
                    throw new Meteor.Error("kicker-not-found", "Spieler nicht gefunden");
                }
            }

            if (data.eventType === EVENT_TYPE_SUBSTITUTION) {
                if (!data.kicker2) {
                    throw new Meteor.Error("kicker-not-found", "2. Spieler nicht gefunden");
                }

                kicker.push(findKickerById(isHomeScore ? ticker.teamHomeFormation : ticker.teamAwayFormation, data.kicker2));

                if (kicker[0] === kicker[1]) {
                    throw new Meteor.Error("kicker-unique", "Spieler kann nicht mit sich selbst getauscht werden");
                }
            }

            var event = {
                eventType: data.eventType,
                kicker: kicker,
                text: data.eventType,
                teamId: teamId,
                tickerId: tickerId
            };
            check(event, TickerEntriesSchema);
            TickerEntries.insert(event);

            if (isGoalEvent(event)) {
                Tickers.update(tickerId, {
                    '$inc': getChangeScoreUpdateValue(1, event.eventType === EVENT_TYPE_OWN_GOAL ? !isHomeScore : isHomeScore)
                });
            }
        },
        addTickerEntry: function (data) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(data, Object);

            var tickerId = data.tickerId;
            check(tickerId, String);

            var ticker = Tickers.findOne(tickerId);
            if (ticker === null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            }

            var tickerEntry = {text: data.tickerEntryText, eventType: EVENT_TYPE_TEXT, tickerId: tickerId};
            check(tickerEntry, TickerEntriesSchema);

            TickerEntries.insert(tickerEntry);
        },
        editTickerEntry: function (tickerId, entryId, tickerEntryText, entryTimestamp) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(tickerId, String);
            check(entryId, String);
            check(tickerEntryText, String);
            check(entryTimestamp, Date);

            var ticker = Tickers.findOne(tickerId);
            if (ticker === null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            }

            var tickerEntry = TickerEntries.findOne({id: entryId});
            if (tickerEntry === null) {
                throw new Meteor.Error("entry-not-found", "Eintrag nicht gefunden!");
            }

            var value = {
                $set: {
                    'timestamp': entryTimestamp
                }
            };

            // update Text only in case of TEXT event
            if (tickerEntry.eventType === EVENT_TYPE_TEXT) {
                value.$set['text'] = tickerEntryText;
            }

            TickerEntries.update({id: entryId}, value);
        },
        deleteTickerEntry: function (tickerId, entryId) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(tickerId, String);
            check(entryId, String);

            var ticker = Tickers.findOne(tickerId);
            if (ticker === null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            }

            var entry = TickerEntries.findOne({id: entryId});

            if (entry && entry.teamId && isGoalEvent(entry)) {
                // reduce score if goal event
                var isHomeScore = entry.teamId === ticker.teamHome && entry.eventType !== EVENT_TYPE_OWN_GOAL;
                if ((isHomeScore ? ticker.scoreHome : ticker.scoreAway) > 0) {
                    Tickers.update({_id: tickerId}, {
                        $inc: getChangeScoreUpdateValue(-1, isHomeScore)
                    });
                }
            }

            TickerEntries.remove({id: entryId});
        },
        updateTicker: function (ticker, tickerId) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(ticker, Object);
            check(tickerId, String);

            var thisTicker = Tickers.findOne(tickerId);
            if (thisTicker === null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            }

            // remove null values from home formation array
            if (ticker.$set.teamHomeFormation && Array.isArray(ticker.$set.teamHomeFormation)) {
                ticker.$set.teamHomeFormation = sortFormation(cleanFormation(ticker.$set.teamHomeFormation), true);
            }

            // remove null values from array formation array
            if (ticker.$set.teamAwayFormation && Array.isArray(ticker.$set.teamAwayFormation)) {
                ticker.$set.teamAwayFormation = sortFormation(cleanFormation(ticker.$set.teamAwayFormation), true);
            }

            Tickers.update(tickerId, ticker);

            var redirect = {
                template: 'adminTickerDetail',
                param: {'_id': tickerId}
            };

            return redirect;
        },
        deleteTicker: function (tickerId) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(tickerId, String);

            Tickers.remove(tickerId, function (error) {
                if (error) {
                    throw new Meteor.Error("ticker-remove", "Während dem Löschen ist ein Fehler aufgetreten!");
                }
            });

            var redirect = {
                template: 'adminTickers'
            };

            return redirect;
        },
        changeScore: function (tickerId, isHomeScore, value) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(tickerId, String);
            check(isHomeScore, Boolean);
            check(value, Number);

            var inc = getChangeScoreUpdateValue(value, isHomeScore);

            Tickers.update(tickerId, {$inc: inc});
        },
        setTime: function (tickerId, timeField) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(tickerId, String);
            check(timeField, String);

            var data = {};
            data[timeField] = new Date();

            Tickers.update(tickerId, {$set: data});
        },
        resetTime: function (tickerId, timeField) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(tickerId, String);
            check(timeField, String);

            var data = {};
            data[timeField] = null;

            Tickers.update(tickerId, {$set: data});
        },
        addTickerComment: function (data) {
            check(data, Object);

            var tickerId = data.tickerId;
            check(tickerId, String);

            var ticker = Tickers.findOne(tickerId);
            if (ticker === null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            } else if (ticker.timeSecondHalfEnd && ticker.timeSecondHalfEnd !== null) {
                throw new Meteor.Error("ticker-finished", "Kommentar kann nicht hinzugefügt werden!");
            }

            var tickerComment = {
                name: data.name,
                text: data.text,
                approved: false
            };

            check(tickerComment, TickerComments);

            Tickers.update(tickerId, {$push: {comments: tickerComment}});

            return tickerComment.name;
        },
        approveTickerComment: function (tickerId, commentId) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(tickerId, String);
            check(commentId, String);

            var ticker = Tickers.findOne(tickerId);
            if (ticker === null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            }

            var comments_filtered = ticker.comments.filter(function (comment) {
                return comment.id === commentId;
            });

            if (comments_filtered.length !== 1) {
                throw new Meteor.Error("comment-not-found", "Kommentar nicht gefunden!");
            }

            var comment = comments_filtered[0];

            var text = comment.name + ": " + comment.text;

            var tickerEntry = {text: text, eventType: EVENT_TYPE_COMMENT, tickerId: tickerId};
            check(tickerEntry, TickerEntriesSchema);

            Tickers.update(tickerId, {
                $pull: { // remove comment from comments
                    comments: {
                        id: commentId
                    }
                }
            });

            TickerEntries.insert(tickerEntry);
        },
        deleteTickerComment: function (tickerId, commentId) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(tickerId, String);
            check(commentId, String);

            Tickers.update(tickerId, {
                $pull: { // remove comment from comments
                    comments: {
                        id: commentId
                    }
                }
            });
        },
        startVoting: function (data) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(data, Object);

            var tickerId = data.tickerId;
            check(tickerId, String);

            var ticker = Tickers.findOne(tickerId);
            if (ticker === null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            }

            if (data.votingEnabled) {
                var teamIds = data.teamIds;
                if (!data.votingDeadline || data.votingDeadline < Date.now()) {
                    throw new Meteor.Error("voting-deadline-invalid", "Die Deadline für die Spielerbewertung liegt in der Vergangenheit!");
                } else if (Array.isArray(teamIds) && (teamIds.indexOf(ticker.teamHome) !== -1 || teamIds.indexOf(ticker.teamAway) !== -1)) {
                    Tickers.update(tickerId, {
                        $set: {
                            votingEnabled: true,
                            votingDeadline: data.votingDeadline,
                            teamHomeVoting: teamIds.indexOf(ticker.teamHome) !== -1,
                            teamAwayVoting: teamIds.indexOf(ticker.teamAway) !== -1
                        }
                    });
                } else {
                    throw new Meteor.Error("no-teams-selected", "Es wurden keine Teams ausgewählt!");
                }
            } else {
                Tickers.update(tickerId, {
                    $set: {
                        votingEnabled: false,
                        votingDeadline: undefined,
                        teamHomeVoting: false,
                        teamAwayVoting: false
                    }
                });
            }
        },
        tickerVoting: function (tickerId, votings) {
            check(tickerId, String);
            check(votings, Object);

            var ticker = Tickers.findOne(tickerId);
            if (ticker === null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            }

            if (ticker.isVotingEnabled()) {
                var votingsData = [];

                for (var kickerId in votings) {
                    var voting = parseInt(votings[kickerId]);

                    if (isNaN(voting)) {
                        throw new Meteor.Error("voting-incomplete", "Bitte alle Spieler bewerten!");
                    } else if (voting < 0 || voting > 5) {
                        throw new Meteor.Error("voting-invalid", "Die Spielerbewertung ist ungültig!");
                    }

                    votingsData.push({
                        'kickerId': kickerId,
                        'voting': voting
                    });
                }

                var ipAddress = this.connection.clientAddress;

                var votingsDataComplete = {
                    'ipAddress': ipAddress,
                    'votings': votingsData
                };

                // check if the user did not vote until now
                if (Array.isArray(ticker.votings) && ticker.votings.find(function (voting) {
                        return voting['ipAddress'] == ipAddress;
                    })) {
                    throw new Meteor.Error("voting-found", "Die Spielerbewertung kann nur einmal durchgeführt werden!");
                } else {
                    Tickers.update(tickerId, {
                        $push: {
                            'votings': votingsDataComplete
                        }
                    }, function (err, cnt) {
                        console.log('error: ' + err + ', updated: ' + cnt);
                    });
                }
            } else {
                throw new Meteor.Error("voting-not-enabled", "Die Spielerbewertung ist deaktiviert!");
            }

            return true;
        }
    });
}