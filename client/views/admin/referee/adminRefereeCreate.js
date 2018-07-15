/**
 * Created by reini on 15.07.18.
 */
Template.adminRefereeCreate.events({
    "click .cancel-button": function (event) {
        event.preventDefault();

        Router.go('adminReferees');

        // Prevent default form submit
        return false;
    }
});