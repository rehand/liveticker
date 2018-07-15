/**
 * Created by reini on 15.07.18.
 */
Template.adminCoachCreate.events({
    "click .cancel-button": function (event) {
        event.preventDefault();

        Router.go('adminCoaches');

        // Prevent default form submit
        return false;
    }
});