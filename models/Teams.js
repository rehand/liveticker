Teams = new Mongo.Collection('Teams');

Teams.attachSchema(
    new SimpleSchema({
        name: {
            type: String
        },
        code: {
            type: String
        },
        createdAt: {
            type: Date,
            autoValue: function () {
                if (this.isInsert) {
                    return new Date;
                }
            },
            denyUpdate: true
        },
        updatedAt: {
            type: Date,
            autoValue: function() {
                if (this.isUpdate) {
                    return new Date();
                }
            },
            denyInsert: true,
            optional: true
        }
    })
);

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

            check(team, {
                name: String,
                code: String
            });

            if (Teams.findOne({code: team.code}) != null) {
                throw new Meteor.Error("team-duplicate-code", "Ein Team mit diesem Code existiert bereits!");
            }

            Teams.insert({
                name: team.name,
                code: team.code,
                createdAt: new Date()
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
        editTeam: function (team) {
            check(team, {
                _id: Meteor.Collection.ObjectID,
                name: String,
                code: String
            });

            if (Teams.findOne(team._id) == null) {
                throw new Meteor.Error("team-not-found", "Team nicht gefunden!");
            }

            if (Teams.findOne({code: team.code}) != null) {
                throw new Meteor.Error("team-duplicate-code", "Ein Team mit diesem Code existiert bereits!");
            }

            Teams.update(team._id, {
                    $set: {
                        name: team.name,
                        code: team.code
                    }
                }
            );
        }
    });
}