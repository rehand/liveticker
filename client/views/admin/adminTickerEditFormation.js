/**
 * Created by reini on 16.06.15.
 */
Template.adminTickerEditFormation.events({
    "click .cancel-button": function (event) {
        event.preventDefault();

        Router.go('adminTickerDetail', {_id: Router.current().params._id});

        // Prevent default form submit
        return false;
    }
});