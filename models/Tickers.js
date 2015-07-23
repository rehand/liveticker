Tickers = new Mongo.Collection('Tickers');

var teamsOptionMapper = function () {
    return Teams.find({}, {sort: {name: 1}}).map(function (team) {
        return {label: team.name + " (" + team.code + ")", value: team._id};
    });
};

KickersFormationSchema = new SimpleSchema({
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
    timestamp: {
        type: Date,
        label: 'Minute',
        optional: true,
        autoValue: function () {
            if (this.isInsert || this.isUpdate) {
                return new Date();
            }
        }
    },
    text: {
        type: String,
        label: 'Text'
    }/*,
     type: {
     type: String,
     allowedValues: ['TEXT','TOR', 'GELB', 'ROT', 'PAUSE', 'ELFMETER', 'WECHSEL']
     }*/
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
        teamHomeFormation: {
            type: [KickersFormationSchema],
            label: 'Aufstellung Heimmannschaft',
            optional: true
        },
        teamAwayFormation: {
            type: [KickersFormationSchema],
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

            ticker.teamHomeFormation = teamHome.kickers.map(setPositionNotDefined);
            ticker.teamAwayFormation = teamAway.kickers.map(setPositionNotDefined);

            Tickers.insert(ticker);

            var redirect = {
                template: 'adminTickers'
            };

            return redirect;
        },
        addTickerEntry: function (data) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(data, Object);

            var tickerId = data.tickerId;
            check(tickerId, String);

            var ticker = Tickers.findOne(tickerId);
            if (ticker == null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            }

            var tickerEntry = {text: data.tickerEntryText};
            check(tickerEntry, TickerEntries);

            Tickers.update(tickerId, {$push: {entries: tickerEntry}});
        },
        removeLastTickerEntry: function (tickerId) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(tickerId, String);

            var ticker = Tickers.findOne(tickerId);
            if (ticker == null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
            }

            Tickers.update(tickerId, {$pop: {entries: 1}});
        },
        updateTicker: function (ticker, tickerId) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(ticker, Object);
            check(tickerId, String);

            var thisTicker = Tickers.findOne(tickerId);
            if (thisTicker == null) {
                throw new Meteor.Error("ticker-not-found", "Ticker nicht gefunden!");
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

            if (Math.abs(value) != 1) {
                throw new Meteor.Error("ticker-changeScore", "Score kann nicht um " + value + " verändert werden!");
            }

            var inc = {};
            inc[isHomeScore ? 'scoreHome' : 'scoreAway'] = value;

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