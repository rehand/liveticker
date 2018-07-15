Referees = new Mongo.Collection('Referees');

refereesOptionMapper = function () {
    return Referees.find({}, {sort: {name: 1}}).map(function (coach) {
        return {
            label: coach.name, 
            value: coach._id
        };
    });
};

RefereeSchema = new SimpleSchema({
    name: {
        type: String,
        label: 'Name'
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

Referees.attachSchema(RefereeSchema);

if (Meteor.isServer) {
    Referees.allow({
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
        addReferee: function (referee) {
            if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }

            check(referee, Referees.simpleSchema());

            if (Referees.findOne({name: referee.name}) != null) {
                throw new Meteor.Error("referee-duplicate-code", "Ein Schiedsrichter mit diesem Namen existiert bereits!");
            }

            Referees.insert({
                name: referee.name
            });

            var redirect = {
                template: 'adminReferees'
            };

            return redirect;
        },
        updateReferee: function (referee, refereeId) {
            if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }

            check(referee, Object);
            check(referee.$set, Referees.simpleSchema());
            check(refereeId, String);

            var thisReferee = Referees.findOne(refereeId);
            if (thisReferee == null) {
                throw new Meteor.Error("referee-not-found", "Schiedsrichter nicht gefunden!");
            }

            var otherReferee = Referees.findOne({name: referee.$set.name});
            if (otherReferee != null && otherReferee._id !== refereeId) {
                throw new Meteor.Error("referee-duplicate-code", "Ein Schiedsrichter mit diesem Namen existiert bereits!");
            }

            Referees.update(refereeId, referee);

            var redirect = {
                template: 'adminRefereeDetail',
                param: {_id: thisReferee._id}
            };

            return redirect;
        },
        deleteReferee: function (refereeId) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(refereeId, String);

            Referees.remove({_id: refereeId}, function (error) {
                if (error) {
                    throw new Meteor.Error("referee-remove", "Während dem Löschen ist ein Fehler aufgetreten!");
                }
            });

            var redirect = {
                template: 'adminReferees'
            };

            return redirect;
        }
    });
}