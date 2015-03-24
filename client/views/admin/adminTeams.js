/**
 * Created by reini on 18.03.15.
 */
if (Meteor.isClient) {
    Template.adminTeams.events({
        "click .delete-team": function (event, template) {
            event.preventDefault();

            // This function is called when the new team form is submitted
            Meteor.call("deleteTeam", event.target.parentNode.value, function(error) {
                if (error) {
                    throwError(error.reason);
                }
            });

            // Prevent default form submit
            return false;
        }
    });
}