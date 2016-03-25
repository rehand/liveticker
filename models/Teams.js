Teams = new Mongo.Collection('Teams');

KickersSchema = new SimpleSchema({
    position: {
        type: String,
        label: 'Position',
        allowedValues: POSITIONS
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

TeamsSchema = new SimpleSchema({
    name: {
        type: String,
        label: 'Name'
    },
    code: {
        type: String,
        label: 'Kürzel'
    },
    kickers: {
        type: [KickersSchema],
        defaultValue: [],
        label: 'Spieler',
        optional: true
    },
    logo: {
        type: String,
        autoform: {
            afFieldInput: {
                type: 'fileUpload',
                collection: 'Images'
            }
        },
        label: 'Logo',
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
    }
});

Teams.attachSchema(TeamsSchema);

Teams.helpers({
    countKickers: function () {
        if (this.kickers) {
            return Object.keys(this.kickers).length;
        }
        return 0;
    },
    getLogo: function () {
        if (this.logo) {
            return Images.findOne(this.logo);
        }
        return "dummy.jpg";
    },
    getAddEventFormName: function () {
        return "addEventForm" + this.code;
    },
    getSubstitionEventFormName: function () {
        return "changeEventForm" + this.code;
    }
});

if (Meteor.isServer) {
    Teams.allow({
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
        addTeam: function (team) {
            if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }

            check(team, Teams.simpleSchema());

            if (Teams.findOne({code: team.code}) != null) {
                throw new Meteor.Error("team-duplicate-code", "Ein Team mit diesem Code existiert bereits!");
            }

            Teams.insert({
                name: team.name,
                code: team.code
            });

            var redirect = {
                template: 'adminTeams'
            };

            return redirect;
        },
        updateTeam: function (team, teamId) {
            if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }

            check(team, Object);
            check(team.$set, Teams.simpleSchema());
            check(teamId, String);

            var thisTeam = Teams.findOne(teamId);
            if (thisTeam == null) {
                throw new Meteor.Error("team-not-found", "Team nicht gefunden!");
            }

            var otherTeam = Teams.findOne({code: team.$set.code});
            if (otherTeam != null && otherTeam._id !== teamId) {
                throw new Meteor.Error("team-duplicate-code", "Ein Team mit diesem Code existiert bereits!");
            }

            // delete logo if changed/deleted
            if ((team.$unset !== undefined && team.$unset.logo !== undefined) || (team.$set.logo !== undefined && thisTeam.logo !== team.$set.logo)) {
                Images.remove(thisTeam.logo, function (error) {
                    if (error) {
                        throw new Error("logo-remove", "Während dem Löschen des Logos ist ein Fehler aufgetreten");
                    }
                });
            }

            // remove null values from kickers array
            if (team.$set.kickers && Array.isArray(team.$set.kickers)) {
                team.$set.kickers = team.$set.kickers.filter(function (kicker) {
                    return kicker !== null;
                });
            }

            Teams.update(teamId, team);

            var redirect = {
                template: 'adminTeamDetail',
                param: {code: thisTeam.code}
            };

            return redirect;
        },
        deleteTeam: function (teamCode) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(teamCode, String);

            Teams.remove({code: teamCode}, function (error) {
                if (error) {
                    throw new Meteor.Error("team-remove", "Während dem Löschen ist ein Fehler aufgetreten!");
                }
            });

            var redirect = {
                template: 'adminTeams'
            };

            return redirect;
        }
    });
}