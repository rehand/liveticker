Template.chatEntry.helpers({
    isTextEntry: function (entry) {
        return (entry ? entry : this).eventType === EVENT_TYPE_TEXT;
    },
    isCommentEntry: function () {
        return this.eventType === EVENT_TYPE_COMMENT;
    },
    getMinuteClasses: function () {
        if (this.showButtons) {
            return "col-xs-12 col-sm-3";
        } else {
            return "col-xs-12 col-sm-3";
        }
    },
    getEntryClasses: function () {
        if (this.showButtons) {
            return "col-xs-offset-1 col-xs-11 col-sm-offset-0 col-sm-9";
        } else {
            return "col-xs-offset-1 col-xs-11 col-sm-offset-0 col-sm-9";
        }
    },
    hasImage: function () {
        return this.image && Images.findOne(this.image);
    },
    getImage: function () {
        if (this.image) {
            return Images.findOne(this.image);
        }
        return null;
    }
});

Template.adminChatDetail.events({
    "click .delete-entry": function (event, template) {
        event.preventDefault();

        var entryId = event.target.getAttribute('data-entry-id');
        if (!entryId) {
            entryId = event.target.parentNode.getAttribute('data-entry-id');
        }

        if (confirm("Möchten Sie den Eintrag wirklich unwiderruflich löschen?")) {
            var chatId = Router.current().params._id;

            Meteor.call("deleteChatEntry", chatId, entryId, function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });
        }

        return false;
    },
    "click .edit-entry": function (event, template) {
        var editDialog = $('#editChatEntry');

        var entryId = this.entry.id;
        editDialog.find('input[name="entryId"]').first().val(entryId);

        var text = this.entry.text;
        editDialog.find('textarea[name="text"]').first().val(text);

        var entryTimestamp = new Date(this.entry.timestamp.getTime() - (this.entry.timestamp.getTimezoneOffset() * 60000)).toISOString().slice(0, -1);
        editDialog.find('input[name="entryTimestamp"]').first().val(entryTimestamp);

        return true;
    }
});

Template.editChatEntry.rendered = function () {
    $('#editChatEntry').on('shown.bs.modal', function (event) {
        Stretchy.resizeAll('textarea');
        $('#editChatEntry').find('textarea[name="text"]').first().focus();
    });

    // register enter key to submit form
    $('.edit-chat-entry textarea').keypress(function (e) {
        if (e.which == 13) {
            $(e.target).parents('form').submit();
            e.preventDefault();
        }
    });
};

Template.editChatEntry.events({
    "submit .edit-chat-entry": function (event) {
        event.preventDefault();

        var target = $(event.target);

        var chatId = Router.current().params._id;
        var entryId = target.find('input[name="entryId"]').first().val();
        var chatEntryText = target.find('textarea[name="text"]').first();
        var entryTimestamp = new Date(target.find('input[name="entryTimestamp"]').first().val());
        if (!entryTimestamp) {
            console.error("Invalid date: ", entryTimestamp);
        }

        Meteor.call("editChatEntry", chatId, entryId, chatEntryText.val(), entryTimestamp,
            function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });

        // Clear form
        chatEntryText.val('');

        // Close modal
        target.find('button.close').click();

        // Prevent default form submit
        return false;
    }
});