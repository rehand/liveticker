function loadTeam(team) {
    var teamAlreadyExists = typeof Teams.findOne({ code : team.code }) === 'object';

  if (!teamAlreadyExists) {
      check(team, Teams.simpleSchema());

      Teams.insert({
          name: team.name,
          code: team.code
      });
  }
}

Meteor.startup(function () {
  var teams = YAML.eval(Assets.getText('teams.yml'));

  for (key in teams) if (teams.hasOwnProperty(key)) {
    loadTeam(teams[key]);
  }
});