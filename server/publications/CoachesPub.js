var coachFieldsExclude = {fields: {createdAt: 0, updatedAt: 0}};
Meteor.publish('Coaches', function () {
    return Coaches.find({}, coachFieldsExclude);
});

Meteor.publish('Coach', function (_id) {
    check(_id, String);
    return Coaches.find({_id: _id}, coachFieldsExclude);
});