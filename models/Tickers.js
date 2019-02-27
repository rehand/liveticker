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
        type: String,
        label: 'Bewertung',
        allowedValues: VOTING_VALUES
    }
});

CoachVotingSchema = new SimpleSchema({
    'coachId': {
        type: String
    },
    'voting': {
        type: String,
        label: 'Bewertung',
        allowedValues: VOTING_VALUES
    }
});

RefereeVotingSchema = new SimpleSchema({
    'refereeId': {
        type: String
    },
    'voting': {
        type: String,
        label: 'Bewertung',
        allowedValues: VOTING_VALUES
    }
});

VotingSchema = new SimpleSchema({
    votings: {
        type: [KickerVotingSchema],
        label: 'Bewertungen'
    },
    coachVotings: {
        type: [CoachVotingSchema],
        optional: true
    },
    refereeVoting: {
        type: RefereeVotingSchema,
        optional: true
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

OvertimePenaltyEventSchema = new SimpleSchema({
    eventType: {
        type: String,
        allowedValues: EVENT_TYPES_OVERTIME_PENALTY,
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

Tickers.attachSchema(
    new SimpleSchema({
        teamHome: {
            type: String,
            label: 'Heimmannschaft',
            autoform: {
                options: teamsOptionMapper
            }
        },
        teamHomeObject: {
            type: [Teams],
            optional: true
        },
        teamAway: {
            type: String,
            label: 'Auswärtsmannschaft',
            autoform: {
                options: teamsOptionMapper
            }
        },
        teamAwayObject: {
            type: [Teams],
            optional: true
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
            label: 'Schiedsrichter',
            autoform: {
                options: refereesOptionMapper
            }
        },
        refereeObject: {
            type: [RefereeSchema],
            optional: true
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
            label: 'Spielerbewertung geöffnet bis',
            optional: true
        },
        votingAutoEnable: {
            type: Boolean,
            defaultValue: false,
            optional: true,
            label: 'Spielerbewertung nach Spielende aktivieren',
            autoform: {
                afFieldInput: {
                    type: "boolean-select",
                    trueLabel: "Automatisch",
                    falseLabel: "Manuell"
                }
            }
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
        votingTickerLinkDisabled: {
            type: Boolean,
            defaultValue: false,
            optional: true
        },
        coachVoting: {
            type: Boolean,
            defaultValue: true,
            label: 'Trainer bewerten',
            optional: true
        },
        refereeVoting: {
            type: Boolean,
            defaultValue: true,
            label: 'Schiedsrichter bewerten',
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
        },
        extraTimeAllowed: {
            type: Boolean,
            defaultValue: false,
            label: 'Verlängerung möglich',
            optional: true
        },
        extraTimeStart: {
            type: Date,
            label: 'Start Verlängerung',
            optional: true
        },
        extraTimeFirstHalfStart: {
            type: Date,
            label: 'Start 1. Halbzeit der Verlängerung',
            optional: true
        },
        extraTimeFirstHalfEnd: {
            type: Date,
            label: 'Ende 1. Halbzeit der Verlängerung',
            optional: true
        },
        extraTimeSecondHalfStart: {
            type: Date,
            label: 'Start 2. Halbzeit der Verlängerung',
            optional: true
        },
        extraTimeSecondHalfEnd: {
            type: Date,
            label: 'Ende 2. Halbzeit der Verlängerung',
            optional: true
        },
        penaltyShootOutStart: {
            type: Date,
            label: 'Start Elfmeterschießen',
            optional: true
        },
        penaltyShootOutEnd: {
            type: Date,
            label: 'Ende Elfmeterschießen',
            optional: true
        },
        overtimePenaltyScoreHome: {
            type: Number,
            optional: true,
            defaultValue: 0,
            min: 0
        },
        overtimePenaltyScoreAway: {
            type: Number,
            optional: true,
            defaultValue: 0,
            min: 0
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
    votingAutoEnable: {
        type: Boolean,
        defaultValue: false,
        optional: true,
        label: 'Spielerbewertung nach Spielende aktivieren',
        autoform: {
            afFieldInput: {
                type: "boolean-select",
                trueLabel: "Automatisch",
                falseLabel: "Manuell"
            }
        }
    },
    votingTickerLinkDisabled: {
        type: Boolean,
        label: 'Zurück zum Ticker-Link',
        defaultValue: true,
        optional: true,
        autoform: {
            afFieldInput: {
                type: "boolean-select",
                trueLabel: "Ausblenden",
                falseLabel: "Anzeigen"
            }
        }
    },
    coachVoting: {
        type: Boolean,
        defaultValue: false,
        label: 'Trainer bewerten',
        optional: true,
        autoform: {
            afFieldInput: {
                type: "boolean-select",
                trueLabel: "Ja",
                falseLabel: "Nein"
            }
        }
    },
    refereeVoting: {
        type: Boolean,
        defaultValue: false,
        label: 'Schiedsrichter bewerten',
        optional: true,
        autoform: {
            afFieldInput: {
                type: "boolean-select",
                trueLabel: "Ja",
                falseLabel: "Nein"
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

function convertPlainTeam (teamObject) {
    // hack so that the plain team object is turned into a team object including all helpers
    var tmpTeamObject = Teams.find({}, {limit: 1}).fetch();

    if (tmpTeamObject && Array.isArray(tmpTeamObject) && tmpTeamObject.length > 0) {
        tmpTeamObject = tmpTeamObject[0];

        // check which properties (except functions which we want to have) are not set in the original object
        var propertiesToDelete = {};
        for (property in tmpTeamObject) {
            if (!teamObject.hasOwnProperty(property) && (typeof tmpTeamObject[property] !== 'function')) {
                propertiesToDelete[property] = property;
            }
        }

        Object.assign(tmpTeamObject, teamObject);

        // remove all properties which weren't set in the original object
        for (property in propertiesToDelete) {
            delete tmpTeamObject[property];
        }
    } else {
        console.error('Could not find team for teamId=', teamObject._id);
    }

    return tmpTeamObject;
}

Tickers.helpers({
    getHomeTeam: function () {
        if (Array.isArray(this.teamHomeObject) && this.teamHomeObject.length > 0) {
            return convertPlainTeam(this.teamHomeObject[0]);
        }
        return {};
    },
    getAwayTeam: function () {
        if (Array.isArray(this.teamAwayObject) && this.teamAwayObject.length > 0) {
            return convertPlainTeam(this.teamAwayObject[0]);
        }
        return {};
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
    },
    homeScoreTotal: function () {
        return (this.scoreHome || 0) + (this.overtimePenaltyScoreHome || 0);
    },
    awayScoreTotal: function () {
        return (this.scoreAway || 0) + (this.overtimePenaltyScoreAway || 0);
    },
    getEndTime: function () {
        var endTime;

        if (this.extraTimeAllowed) {
            if (this.penaltyShootOutStart) {
                endTime = this.penaltyShootOutEnd;
            } else {
                endTime = this.extraTimeSecondHalfEnd;
            }
        } else {
            endTime = this.timeSecondHalfEnd;
        }

        return endTime;
    },
    getReferee: function () {
        if (this.refereeObject && Array.isArray(this.refereeObject) && this.refereeObject.length > 0) {
            return this.refereeObject[0].name;
        }
        return this.referee;
    }
});

if (Meteor.isServer) {
    function isGoalEvent(event) {
        return event.eventType === EVENT_TYPE_GOAL || event.eventType === EVENT_TYPE_PENALTY_GOAL || event.eventType === EVENT_TYPE_OWN_GOAL;
    }

    function isOvertimePenaltyGoalEvent(event) {
        return event.eventType == EVENT_TYPE_OVERTIME_PENALTY_CONVERTED;
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
        if (Math.abs(value) !== 1) {
            throw new Meteor.Error("ticker-changeScore", "Score kann nicht um " + value + " verändert werden!");
        }

        var inc = {};
        inc[isHomeScore ? 'scoreHome' : 'scoreAway'] = value;
        return inc;
    }

    function getChangeOvertimePenaltyScoreUpdateValue(value, isHomeScore) {
        if (Math.abs(value) !== 1) {
            throw new Meteor.Error("ticker-changeScore", "Elfmeterscore kann nicht um " + value + " verändert werden!");
        }

        var inc = {};
        inc[isHomeScore ? 'overtimePenaltyScoreHome' : 'overtimePenaltyScoreAway'] = value;
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

            ticker.teamHomeObject = [teamHome];
            ticker.teamAwayObject = [teamAway];

            if (ticker.referee) {
                var referee = Referees.findOne(ticker.referee);
                if (!referee) {
                    throw new Meteor.Error("referee-not-found", "Schiedsrichter nicht gefunden!");
                }
                ticker.refereeObject = [referee];
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
            } else if (isOvertimePenaltyGoalEvent(event)) {
                Tickers.update(tickerId, {
                    '$inc': getChangeOvertimePenaltyScoreUpdateValue(1, isHomeScore)
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
        moveTickerEntry: function (tickerId, entryId, entryIdTarget) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(tickerId, String);
            check(entryId, String);
            check(entryIdTarget, String);

            var ticker = Tickers.findOne(tickerId, {comments: 1});
            if (ticker === null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            }

            var tickerEntry = TickerEntries.findOne({id: entryId});
            if (tickerEntry === null || tickerEntry.tickerId !== tickerId) {
                throw new Meteor.Error("entry-not-found", "Eintrag nicht gefunden!");
            }

            var tickerEntryTarget = TickerEntries.findOne({id: entryIdTarget});
            if (tickerEntryTarget === null || tickerEntryTarget.tickerId !== tickerId) {
                throw new Meteor.Error("entry-not-found", "Ziel-Eintrag nicht gefunden!");
            }

            // move all entries which would collide (which are within a range of 10ms) one ms down
            TickerEntries.find({
                tickerId: tickerId, 
                timestamp: {
                    $gt: new Date(tickerEntryTarget.timestamp - 11),
                    $lt: tickerEntryTarget.timestamp
                }
            }).fetch().forEach(function (entryToMove) {
                if (entryToMove.id !== entryId) {
                    TickerEntries.update({
                        tickerId: tickerId,
                        id: entryToMove.id
                    }, {
                        $set: {
                            'timestamp': new Date(entryToMove.timestamp - 1)
                        }
                    });
                }
            });
            
            TickerEntries.update({
                tickerId: tickerId, 
                id: entryId
            }, {
                $set: {
                    'timestamp': new Date(tickerEntryTarget.timestamp - 1)
                }
            });
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

            if (entry && entry.teamId) {
                if (isGoalEvent(entry)) {
                    // reduce score if goal event
                    var isHomeScore = entry.teamId === ticker.teamHome && entry.eventType !== EVENT_TYPE_OWN_GOAL;
                    if ((isHomeScore ? ticker.scoreHome : ticker.scoreAway) > 0) {
                        Tickers.update({_id: tickerId}, {
                            $inc: getChangeScoreUpdateValue(-1, isHomeScore)
                        });
                    }
                } else if (isOvertimePenaltyGoalEvent(entry)) {
                    var isHomeScore = entry.teamId === ticker.teamHome;
                    if ((isHomeScore ? ticker.overtimePenaltyScoreHome : ticker.overtimePenaltyScoreAway) > 0) {
                        Tickers.update({_id: tickerId}, {
                            $inc: getChangeOvertimePenaltyScoreUpdateValue(-1, isHomeScore)
                        });
                    }
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

            // keep teamHome ID and teamHomeObject in sync
            if (ticker.$set.teamHome && thisTicker.teamHome !== ticker.$set.teamHome) {
                ticker.$set.teamHomeObject = [Teams.findOne(ticker.$set.teamHome)];
            }

            // keep teamAway ID and teamAwayObject in sync
            if (ticker.$set.teamAway && thisTicker.teamAway !== ticker.$set.teamAway) {
                ticker.$set.teamAwayObject = [Teams.findOne(ticker.$set.teamAway)];
            }

            // update referee
            if (ticker.$unset && 'referee' in ticker.$unset) {
                ticker.$unset.refereeObject = true;
            } else if (ticker.$set.referee && ticker.$set.referee !== thisTicker.referee) {
                var referee = Referees.findOne(ticker.$set.referee);
                if (!referee) {
                    throw new Meteor.Error("referee-not-found", "Schiedsrichter nicht gefunden!");
                }
                // remove createdAt because it can not be set during an update
                delete referee.createdAt;
                ticker.$set.refereeObject = [referee];
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
        setTime: function (tickerId, timeFields) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(tickerId, String);
            check(timeFields, Array);

            var ticker = Tickers.findOne(tickerId);
            if (ticker === null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            }

            var timeField = timeFields[0];
            var currentDate = new Date();

            var data = {};
            data[timeField] = currentDate;

            if (    ticker.votingAutoEnable
                &&  ((timeFields.length <= 1 || !timeFields[1]) && (timeField === 'timeSecondHalfEnd' || timeField === 'extraTimeSecondHalfEnd' || timeField === 'penaltyShootOutEnd' ))) {
                if (!ticker.votingDeadline || data.votingDeadline < Date.now()) {
                    var votingDeadline = new Date();
                    votingDeadline.setDate(currentDate.getDate() + 1);

                    data['votingDeadline'] = votingDeadline;
                }
                data['votingEnabled'] = true;
            }

            if (timeFields.length > 1 && !!timeFields[1]) {
                var timeField2 = timeFields[1];
                data[timeField2] = currentDate;
            }

            Tickers.update(tickerId, {$set: data});
        },
        resetTime: function (tickerId, timeFields) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(tickerId, String);
            check(timeFields, Array);

            var ticker = Tickers.findOne(tickerId);
            if (ticker === null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            }

            var timeField = timeFields[0];

            var data = {};
            data[timeField] = null;

            if (timeField === 'timeSecondHalfEnd' || timeField === 'extraTimeSecondHalfEnd' || timeField === 'penaltyShootOutEnd') {
                data['votingEnabled'] = false;
            }

            if (timeFields.length > 1 && !!timeFields[1]) {
                var timeField2 = timeFields[1];
                data[timeField2] = data[timeField];
            }

            Tickers.update(tickerId, {$set: data});
        },
        addTickerComment: function (data) {
            check(data, Object);

            var tickerId = data.tickerId;
            check(tickerId, String);

            var ticker = Tickers.findOne(tickerId);
            if (ticker === null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            } else if (ticker.getEndTime() && new Date().getTime() - ticker.getEndTime().getTime() > COMMENTS_ALLOWED_AFTER_END_MILLIS) {
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
        deleteAllTickerComments: function (tickerId, timestampLimit) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(tickerId, String);
            check(timestampLimit, Date);

            var ticker = Tickers.findOne(tickerId, {comments: 1});
            if (ticker === null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            }

            var commentIds = ticker.comments.filter(function (comment) {
                return comment.timestamp <= timestampLimit;
            }).map(function (comment) {
                return comment.id;
            });

            if (commentIds.length > 0) {
                const params = {
                    $pull: { // remove matched comments from comments
                        comments: {
                            id: { 
                                $in: commentIds, 
                            }
                        }
                    }
                };
                Tickers.update(tickerId, params);
            }
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

            var teamIds = data.teamIds;
            if (!data.votingAutoEnable && (!data.votingDeadline || data.votingDeadline < Date.now())) {
                throw new Meteor.Error("voting-deadline-invalid", "Die Deadline für die Spielerbewertung liegt in der Vergangenheit!");
            } else if (Array.isArray(teamIds) && (teamIds.indexOf(ticker.teamHome) !== -1 || teamIds.indexOf(ticker.teamAway) !== -1)) {
                Tickers.update(tickerId, {
                    $set: {
                        votingEnabled: data.votingEnabled,
                        votingAutoEnable: data.votingAutoEnable,
                        votingDeadline: data.votingDeadline ? data.votingDeadline : null,
                        votingTickerLinkDisabled: data.votingTickerLinkDisabled,
                        teamHomeVoting: teamIds.indexOf(ticker.teamHome) !== -1,
                        teamAwayVoting: teamIds.indexOf(ticker.teamAway) !== -1,
                        coachVoting: data.coachVoting,
                        refereeVoting: data.refereeVoting
                    }
                });
            } else {
                throw new Meteor.Error("no-teams-selected", "Es wurden keine Teams ausgewählt!");
            }
        },
        tickerVoting: function (tickerId, votings, coachVotings, refereeVoting) {
            check(tickerId, String);
            check(votings, Object);
            check(coachVotings, Object);
            check(refereeVoting, Object);

            var ticker = Tickers.findOne(tickerId);
            if (ticker === null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            }

            if (ticker.isVotingEnabled()) {
                var votingsData = [];
                for (var kickerId in votings) {
                    var voting = parseFloat(votings[kickerId]).toString();

                    if (isNaN(voting)) {
                        throw new Meteor.Error("voting-incomplete", "Bitte alle Spieler bewerten!");
                    } else if (VOTING_VALUES.indexOf(voting) === -1) {
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
                    'votings': votingsData,
                    'timestamp': Date.now()
                };

                if (coachVotings) {
                    var coachVotingsData = [];
                    var coachIdHome = ticker.getHomeTeam().coach;
                    var coachIdAway = ticker.getAwayTeam().coach;

                    for (var coachId in coachVotings) {
                        var voting = parseFloat(coachVotings[coachId]).toString();
    
                        if (isNaN(voting)) {
                            throw new Meteor.Error("voting-incomplete-coach", "Bitte alle Trainer bewerten!");
                        } else if (VOTING_VALUES.indexOf(voting) === -1) {
                            throw new Meteor.Error("voting-invalid", "Die Trainerbewertung ist ungültig!");
                        }
                        
                        if (!coachId || ((coachIdHome && coachId != coachIdHome) && (coachIdAway && coachId != coachIdAway))) {
                            throw new Meteor.Error("voting-invalid-coach", "Die Trainerbewertung ist ungültig!");
                        }
    
                        coachVotingsData.push({
                            'coachId': coachId,
                            'voting': voting
                        });
                    }

                    if (coachVotingsData) {
                        votingsDataComplete['coachVotings'] = coachVotingsData;
                    }
                }

                if (refereeVoting && 'refereeId' in refereeVoting && 'voting' in refereeVoting) {
                    var refereeVotingData = {};
                    refereeVotingData = {
                        refereeId: refereeVoting.refereeId,
                        voting: refereeVoting.voting
                    };

                    votingsDataComplete['refereeVoting'] = refereeVotingData;
                }

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
                    });
                }
            } else {
                throw new Meteor.Error("voting-not-enabled", "Die Spielerbewertung ist deaktiviert!");
            }

            return true;
        }
    });
}