/**
 * Created by reini on 16.06.15.
 */
Template.adminTickerCreate.events({
    "click .cancel-button": function (event) {
        event.preventDefault();

        Router.go('adminTickers');

        // Prevent default form submit
        return false;
    }
});