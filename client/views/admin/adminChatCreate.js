Template.adminChatCreate.events({
    "click .cancel-button": function (event) {
        event.preventDefault();

        Router.go('adminChats');

        // Prevent default form submit
        return false;
    }
});