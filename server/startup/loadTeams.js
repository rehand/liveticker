function loadTeam(team) {
    var teamAlreadyExists = typeof Teams.findOne({ code : team.code }) === 'object';

  if (!teamAlreadyExists) {
      Meteor.call("addTeam", team);
  }
}

Meteor.startup(function () {
  var teams = YAML.eval(Assets.getText('teams.yml'));

  for (key in teams) if (teams.hasOwnProperty(key)) {
    loadTeam(teams[key]);
  }
});