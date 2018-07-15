var coachFieldsExclude = {fields: {createdAt: 0, updatedAt: 0}};
Meteor.publish('Referees', function () {
    return Referees.find({}, coachFieldsExclude);
});

Meteor.publish('Referee', function (_id) {
    check(_id, String);
    return Referees.find({_id: _id}, coachFieldsExclude);
});