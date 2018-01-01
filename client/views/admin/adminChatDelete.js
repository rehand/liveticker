Template.adminChatDelete.events({
    "click .cancel-button": function (event) {
        event.preventDefault();

        Router.go('adminChatEdit', {_id: Router.current().params._id});

        // Prevent default form submit
        return false;
    },
    "submit .deleteChatForm": function (event) {
        event.preventDefault();

        var chatId = Router.current().params._id;

        Meteor.call("deleteChat", chatId, function(error, data) {
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