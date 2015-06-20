/**
 * Created by reini on 16.06.15.
 */
Template.adminTeamCreate.events({
    "click .cancel-button": function (event) {
        event.preventDefault();

        Router.go('adminTeams');

        // Prevent default form submit
        return false;
    }
});