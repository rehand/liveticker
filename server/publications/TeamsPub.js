Meteor.publish('Teams', function () {
  return Teams.find();
});

Meteor.publish('Team', function (code) {
    check(code, String);
    return Teams.find({code: code});
});