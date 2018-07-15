Coaches = new Mongo.Collection('Coaches');

coachesOptionMapper = function () {
    return Coaches.find({}, {sort: {name: 1}}).map(function (coach) {
        return {
            label: coach.name, 
            value: coach._id
        };
    });
};

CoachSchema = new SimpleSchema({
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

Coaches.attachSchema(CoachSchema);

if (Meteor.isServer) {
    Coaches.allow({
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
        addCoach: function (coach) {
            if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }

            check(coach, Coaches.simpleSchema());

            if (Coaches.findOne({name: coach.name}) != null) {
                throw new Meteor.Error("coach-duplicate-code", "Ein Trainer mit diesem Namen existiert bereits!");
            }

            Coaches.insert({
                name: coach.name
            });

            var redirect = {
                template: 'adminCoaches'
            };

            return redirect;
        },
        updateCoach: function (coach, coachId) {
            if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }

            check(coach, Object);
            check(coach.$set, Coaches.simpleSchema());
            check(coachId, String);

            var thisCoach = Coaches.findOne(coachId);
            if (thisCoach == null) {
                throw new Meteor.Error("coach-not-found", "Trainer nicht gefunden!");
            }

            var otherCoach = Coaches.findOne({name: coach.$set.name});
            if (otherCoach != null && otherCoach._id !== coachId) {
                throw new Meteor.Error("coach-duplicate-code", "Ein Trainer mit diesem Namen existiert bereits!");
            }

            Coaches.update(coachId, coach);

            var redirect = {
                template: 'adminCoachDetail',
                param: {_id: thisCoach._id}
            };

            return redirect;
        },
        deleteCoach: function (coachId) {
            if (!this.userId) {
                throw new Meteor.Error("not-authorized");
            }

            check(coachId, String);

            Coaches.remove({_id: coachId}, function (error) {
                if (error) {
                    throw new Meteor.Error("coach-remove", "Während dem Löschen ist ein Fehler aufgetreten!");
                }
            });

            var redirect = {
                template: 'adminCoaches'
            };

            return redirect;
        }
    });
}