/**
 * Created by reini on 16.06.15.
 */
Template.adminTeamDelete.events({
    "click .cancel-button": function (event) {
        event.preventDefault();

        Router.go('adminTeamEdit', {code: Router.current().params.code});

        // Prevent default form submit
        return false;
    }
});

Template.adminTeamDelete.events({
    "submit .deleteTeamForm": function (event) {
        event.preventDefault();

        var teamCode = Router.current().params.code;

        Meteor.call("deleteTeam", teamCode, function(error, data) {
            if (error) {
                console.error('error ' + error.reason);
            } else if (data && data.template) {
                if (data.param) {
                    Router.go(data.template, data.param);
                } else {
                    Router.go(data.template);
                }
            }
        });

        // Prevent default form submit
        return false;
    }
});