/**
 * Created by reini on 16.06.15.
 */
Template.adminTickerDelete.events({
    "click .cancel-button": function (event) {
        event.preventDefault();

        Router.go('adminTickerEdit', {_id: Session.get('activeTickerId')});

        // Prevent default form submit
        return false;
    }
});

Template.adminTickerDelete.events({
    "submit .deleteTickerForm": function (event) {
        event.preventDefault();

        var tickerId = Session.get('activeTickerId');

        Meteor.call("deleteTicker", tickerId, function(error, data) {
            if (error) {
                console.error('error ' + error.reason);
                //throwError(error.reason);
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