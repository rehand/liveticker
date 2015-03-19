Meteor.publish('Teams', function () {
  return Teams.find();
});

Meteor.publish('Team', function (code) {
    return Teams.find({code: code});
});