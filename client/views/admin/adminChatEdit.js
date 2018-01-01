Template.adminChatEdit.events({
    "click .cancel-button": function (event) {
        event.preventDefault();

        Router.go('adminChatDetail', {_id: Router.current().params._id});

        // Prevent default form submit
        return false;
    }
});