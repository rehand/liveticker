Meteor.publish('TeamLogo', function (teamId) {
    check(teamId, String);
    var team = Teams.findOne({code: teamId});
    return Images.find(team.logo);
});