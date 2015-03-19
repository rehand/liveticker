/**
 * Created by reini on 18.03.15.
 */
if (Meteor.isClient) {
    Template.adminTeams.events({
        "submit .new-team": function (event, template) {
            event.preventDefault();

            //clearErrors();

            // This function is called when the new team form is submitted
            Meteor.call("addTeam", {
                name: event.target.name.value,
                code: event.target.code.value
            }, function(error) {
                if (error) {
                    throwError(error.reason);
                } else {
                    // Clear form
                    event.target.name.value = "";
                    event.target.code.value = "";
                }
            });

            // Prevent default form submit
            return false;
        },
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