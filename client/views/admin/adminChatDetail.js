var timer;

Template.adminChatDetail.rendered = function () {
    $('.add-chat-entry textarea').keypress(function (e) {
        if (e.which == 13) {
            $(e.target).parents('form').submit();
            e.preventDefault();
        }
    });
};

Template.addChatEntry.events({
    "submit .add-chat-entry": function (event) {
        event.preventDefault();

        var chatEntryText = event.target[0].value;
        var chatId = Router.current().params._id;

        Meteor.call("addChatEntry", {chatId: chatId, chatEntryText: chatEntryText}, function (error) {
            if (error) {
                console.error('error ' + error.reason);
                //throwError(error.reason);
            }
        });

        // Clear form
        event.target[0].value = "";

        // Resize form
        Stretchy.resizeAll('textarea');

        // Prevent default form submit
        return false;
    }
});

Template.chatComment.events({
    "click .delete-comment": function (event) {
        return commentEvent(event, "deleteChatComment");
    },
    "click .approve-comment": function (event) {
        return commentEvent(event, "approveChatComment");
    }
});

var commentEvent = function (event, method) {
    event.preventDefault();

    var commentId = event.target.getAttribute('data-comment-id');
    if (!commentId) {
        commentId = event.target.parentNode.getAttribute('data-comment-id');
    }
    var chatId = Router.current().params._id;

    Meteor.call(method, chatId, commentId, function (error) {
        if (error) {
            console.error('error ' + error.reason);
        }
    });

    // Prevent default form submit
    return false;
};

Template.adminChatDetail.events({
    "click .time-button": function (event) {
        event.preventDefault();

        if (confirm("Möchten Sie wirklich zur nächsten Chatphase wechseln?")) {
            var type = event.target.getAttribute('data-type');
            if (!type) {
                type = event.target.parentNode.getAttribute('data-type');
            }
            var chatId = Router.current().params._id;

            Meteor.call("setChatTime", chatId, type, function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });
        }

        return false;
    },
    "click .reset-time-button": function (event) {
        event.preventDefault();

        if (confirm("Möchten Sie wirklich in die vorherige Chatphase zurückkehren?")) {
            var type = event.target.getAttribute('data-type');
            if (!type) {
                type = event.target.parentNode.getAttribute('data-type');
            }
            var chatId = Router.current().params._id;

            Meteor.call("resetChatTime", chatId, type, function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });
        }

        return false;
    }
});
