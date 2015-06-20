/**
 * Created by reini on 16.06.15.
 */
Template.adminTickerEdit.events({
    "click .cancel-button": function (event) {
        event.preventDefault();

        Router.go('adminTickerDetail', {_id: Session.get('activeTickerId')});

        // Prevent default form submit
        return false;
    }
});