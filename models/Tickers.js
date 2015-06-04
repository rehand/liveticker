Tickers = new Mongo.Collection('Tickers');

var teamsOptionMapper = function () {
    return Teams.find({}, {sort: {name: 1}}).map(function (team) {
        return {label: team.name + " (" + team.code + ")", value: team._id};
    });
};

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
        }
    })
);

Tickers.helpers({
    getHomeTeam: function() {
        return Teams.findOne(this.teamHome);
    },
    getAwayTeam: function() {
        return Teams.findOne(this.teamAway);
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

            Tickers.insert(ticker);
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
        }
        //deleteTicker: function (id) {
        //    if (!Meteor.userId()) {
        //        throw new Meteor.Error("not-authorized");
        //    }
        //
        //    check(id, String);
        //
        //    Teams.remove(id, function (error) {
        //        if (error) {
        //            throw new Meteor.Error("team-remove", "Während dem Löschen ist ein Fehler aufgetreten!");
        //        }
        //    });
        //},
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