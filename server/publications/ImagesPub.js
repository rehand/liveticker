Meteor.publish('TeamLogo', function (teamId) {
    check(teamId, String);
    var team = Teams.findOne({code: teamId});
    return Images.findOne(team.logo);
});

Meteor.publish('Images', function () {
    return Images.find();
});