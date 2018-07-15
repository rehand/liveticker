/**
 * Created by reini on 15.07.18.
 */
Template.adminRefereeDelete.events({
    "click .cancel-button": function (event) {
        event.preventDefault();

        Router.go('adminRefereeEdit', {_id: Router.current().params._id});

        // Prevent default form submit
        return false;
    }
});

Template.adminRefereeDelete.events({
    "submit .deleteRefereeForm": function (event) {
        event.preventDefault();

        var _id = Router.current().params._id;

        Meteor.call("deleteReferee", _id, function(error, data) {
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