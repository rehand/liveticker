Tickers = new Mongo.Collection('Tickers');

var teamsOptionMapper = function () {
    return Teams.find({}, {sort: {name: 1}}).map(function (team) {
        return {label: team.name + " (" + team.code + ")", value: team._id};
    });
};

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
                type: "boolean-select",
                trueLabel: "Ja",
                falseLabel: "Nein"
            }
        }
    }
});

TickerEntries = new SimpleSchema({
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
        label: 'Minute',
        optional: true,
        autoValue: function () {
            if (!this.isSet && this.operator !== "$pull") {
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
    }
});

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
        defaultValue: EVENT_TYPE_TEXT,
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
        description: {
            type: String,
            optional: true,
            label: 'Zusatzinformationen',
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
            optional: true
        },
        timeFirstHalfEnd: {
            type: Date,
            optional: true
        },
        timeSecondHalfStart: {
            type: Date,
            optional: true
        },
        timeSecondHalfEnd: {
            type: Date,
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
            type: [TickerEntries],
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
        }
    })
);

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
                teamId: teamId
            };
            check(event, TickerEntries);

            var updateData = {$push: {entries: event}};

            if (isGoalEvent(event)) {
                updateData['$inc'] = getChangeScoreUpdateValue(1, event.eventType === EVENT_TYPE_OWN_GOAL ? !isHomeScore : isHomeScore);
            }

            Tickers.update(tickerId, updateData);
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

            var tickerEntry = {text: data.tickerEntryText, eventType: EVENT_TYPE_TEXT};
            check(tickerEntry, TickerEntries);

            Tickers.update(tickerId, {$push: {entries: tickerEntry}});
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

            var updateData = {$pull: {'entries': {'id': entryId}}};

            var entries_filtered = ticker.entries.filter(function (entry) {
                return entry.id === entryId;
            });

            if (entries_filtered.length > 0) {
                var event = entries_filtered[0];
                // reduce score if goal event
                if (event.teamId && isGoalEvent(event)) {
                    var isHomeScore = event.teamId === ticker.teamHome && event.eventType !== EVENT_TYPE_OWN_GOAL;
                    if ((isHomeScore ? ticker.scoreHome : ticker.scoreAway) > 0) {
                        updateData['$inc'] = getChangeScoreUpdateValue(-1, isHomeScore);
                    }
                }
            }

            Tickers.update({_id: tickerId}, updateData);
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
                ticker.$set.teamHomeFormation = cleanFormation(ticker.$set.teamHomeFormation);
            }

            // remove null values from aray formation array
            if (ticker.$set.teamAwayFormation && Array.isArray(ticker.$set.teamAwayFormation)) {
                ticker.$set.teamAwayFormation = cleanFormation(ticker.$set.teamAwayFormation);
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

            var tickerEntry = {text: text, eventType: EVENT_TYPE_COMMENT};
            check(tickerEntry, TickerEntries);

            Tickers.update(tickerId, {
                $push: { // add comment to entries
                    entries: tickerEntry
                },
                $pull: { // remove comment from comments
                    comments: {
                        id: commentId
                    }
                }
            });
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
        }
        //updateTicker: function (ticker, tickerId) {
        //    if (!Meteor.userId()) {
        //        throw new Meteor.Error("not-authorized");
        //    }
        //
        //    check(team, Object);
        //    check(team.$set, Teams.simpleSchema());
        //    check(teamId, String);
        //
        //    var thisTeam = Teams.findOne(teamId);
        //    if (thisTeam == null) {
        //        throw new Meteor.Error("team-not-found", "Team nicht gefunden!");
        //    }
        //
        //    var otherTeam = Teams.findOne({code: team.$set.code});
        //    if (otherTeam != null && otherTeam._id !== teamId) {
        //        throw new Meteor.Error("team-duplicate-code", "Ein Team mit diesem Code existiert bereits!");
        //    }
        //
        //    // delete logo if changed/deleted
        //    if ((team.$unset !== undefined && team.$unset.logo !== undefined) || (team.$set.logo !== undefined && thisTeam.logo !== team.$set.logo)) {
        //        Images.remove(thisTeam.logo, function (error) {
        //            if (error) {
        //                throw new Error("logo-remove", "Während dem Löschen des Logos ist ein Fehler aufgetreten");
        //            }
        //        });
        //    }
        //
        //    Teams.update(teamId, team);
        //
        //    var redirect = {};
        //
        //    redirect.template = 'adminTeams';
        //
        //    return redirect;
        //}
    });
}