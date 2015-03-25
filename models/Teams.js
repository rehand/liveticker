Teams = new Mongo.Collection('Teams');

MembersSchema = new SimpleSchema({
    position: {
        type: String,
        allowedValues: ['TW','IV', 'LA', 'RA', 'ZDM', 'ZM', 'ZOM', 'LM', 'RM', 'ST']
    },
    name: {
        type: String
    }
});

Teams.attachSchema(
    new SimpleSchema({
        name: {
            type: String
        },
        code: {
            type: String
        },
        members: {
            type: [MembersSchema],
            optional: true
        },
        createdAt: {
            type: Date,
            autoValue: function () {
                if (this.isInsert) {
                    return new Date;
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
    })
);

Teams.helpers({
   countMembers: function() {
       if (this.members) {
           return Object.keys(this.members).length;
       }
       return 0;
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
            // Make sure the user is logged in before inserting a tea,
            //if (!Meteor.userId()) {
            //    throw new Meteor.Error("not-authorized");
            //}

            check(team, Teams.simpleSchema());

            if (Teams.findOne({code: team.code}) != null) {
                throw new Meteor.Error("team-duplicate-code", "Ein Team mit diesem Code existiert bereits!");
            }

            Teams.insert({
                name: team.name,
                code: team.code
            });
        },
        deleteTeam: function (id) {
            check(id, String);

            Teams.remove(id, function (error) {
                if (error) {
                    throw new Meteor.Error("team-remove", "Während dem Löschen ist ein Fehler aufgetreten!");
                }
            });
        },
        updateTeam: function (team, teamId) {
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

            Teams.update(teamId, team);

            var redirect = {};

            if (thisTeam.code !== team.$set.code) {
                redirect.template = 'adminTeamsDetail';
                redirect.param = {
                    code: team.$set.code
                };
            } else {
                redirect.template = 'adminTeams';
            }

            return redirect;
        }
    });
}