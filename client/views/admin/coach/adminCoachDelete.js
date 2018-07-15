/**
 * Created by reini on 15.07.18.
 */
Template.adminCoachDelete.events({
    "click .cancel-button": function (event) {
        event.preventDefault();

        Router.go('adminCoachEdit', {_id: Router.current().params._id});

        // Prevent default form submit
        return false;
    }
});

Template.adminCoachDelete.events({
    "submit .deleteCoachForm": function (event) {
        event.preventDefault();

        var _id = Router.current().params._id;

        Meteor.call("deleteCoach", _id, function(error, data) {
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