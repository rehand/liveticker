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
    coach: {
        type: String,
        label: 'Trainer',
        optional: true,
        autoform: {
            options: coachesOptionMapper
        }
    },
    coachObject: {
        type: [CoachSchema],
        optional: true
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
    goalText: {
        type: String,
        label: 'Tortext',
        optional: true
    },
    anthem: {
        type: String,
        label: 'Torhymne',
        allowedValues: TEAM_ANTHEMS.map(function(entry) {
            return entry.value
        }),
        autoform: {
            afFieldInput: {
                type: 'select',
                options: TEAM_ANTHEMS
            }
        },
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
    },
    getAddOvertimePenaltyEventFormName: function () {
        return "addOvertimePenaltyEventForm" + this.code;
    },
    getCoachEventFormName: function () {
        return "coachEventForm" + this.code;
    },
    getAnthem: function () {
        if (this.anthem) {
            var anthemValue = this.anthem;
            var foundAnthems = TEAM_ANTHEMS.filter(function (anthem) {
                return anthem.value == anthemValue;
            });
            if (foundAnthems.length > 0) {
                return foundAnthems[0];
            }
        }
        return null;
    },
    getAnthemName: function () {
        var foundAnthem = this.getAnthem();
        if (foundAnthem) {
            return foundAnthem.label;
        }
        return null;
    },
    getAnthemPath: function () {
        var foundAnthem = this.getAnthem();
        if (foundAnthem) {
            return foundAnthem.path;
        }
        return null;
    },
    getCoach: function () {
        if (this.coachObject && Array.isArray(this.coachObject) && this.coachObject.length > 0) {
            return this.coachObject[0].name;
        }
        return this.coach;
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

            var newTeam = {
                name: team.name,
                code: team.code,
                coach: team.coach
            };

            if (team.coach) {
                var coach = Coaches.findOne(team.coach);
                if (!coach) {
                    throw new Meteor.Error("coach-not-found", "Trainer nicht gefunden!");
                }
                newTeam.coachObject = [coach];
            }

            Teams.insert(newTeam);

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

            // update coach
            if (team.$unset !== undefined && 'coach' in team.$unset) {
                team.$unset.coachObject = true;
            } else if (team.$set !== undefined && team.$set.coach && team.$set.coach !== thisTeam.coach) {
                var coach = Coaches.findOne(team.$set.coach);
                if (!coach) {
                    throw new Meteor.Error("coach-not-found", "Trainer nicht gefunden!");
                }
                // remove createdAt because it can not be set during an update
                delete coach.createdAt;
                team.$set.coachObject = [coach];
            }

            // remove null values from kickers array
            if (team.$set !== undefined && team.$set.kickers && Array.isArray(team.$set.kickers)) {
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