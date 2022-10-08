var timer;

Template.adminChatDetail.rendered = function () {
    $('.add-chat-entry textarea').keypress(function (e) {
        if (e.which == 13) {
            $(e.target).parents('form').submit();
            e.preventDefault();
        }
    });
};

Template.adminChatDetail.helpers({
    sortReverse: function (entries) {
        return sortReverse(entries);
    }
});

Template.addChatEntry.events({
    "submit .add-chat-entry": function (event) {
        event.preventDefault();

        var chatEntryText = event.target[0].value;
        var chatId = Router.current().params._id;

        var files = $('#chatEntryImageUpload')[0].files;
        if (files && files.length > 0) {
            var file = files[0];
            var fr = new FileReader();
            fr.onload = function () {
                img = new Image();
                img.onload = function () {
                    var width = img.width;
                    var height = img.height;

                    if (width > height) {
                        if (width > MAX_IMAGE_UPLOAD_WIDTH) {
                            height *= MAX_IMAGE_UPLOAD_WIDTH / width;
                            width = MAX_IMAGE_UPLOAD_WIDTH;
                        }
                    } else {
                        if (height > MAX_IMAGE_UPLOAD_HEIGHT) {
                            width *= MAX_IMAGE_UPLOAD_HEIGHT / height;
                            height = MAX_IMAGE_UPLOAD_HEIGHT;
                        }
                    }

                    var canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;

                    var ctx = canvas.getContext("2d");
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, width, height);

                    var dataUrl = canvas.toDataURL("image/jpeg", 0.5);

                    Images.insert(dataUrl, function (err, fileObj) {
                        if (err) {
                            console.error('error during image upload', err);
                            alert('Bild konnte nicht hochgeladen werden');
                            return;
                        }

                        callAddChatEntry(chatId, chatEntryText, event, fileObj._id);
                    });
                };
                img.src = fr.result;
            };
            fr.readAsDataURL(file);
        } else {
            callAddChatEntry(chatId, chatEntryText, event);
        }

        // Prevent default form submit
        return false;
    }
});

var callAddChatEntry = function (chatId, chatEntryText, event, imageId) {
    try {
        Meteor.call("addChatEntry", {
            chatId: chatId,
            chatEntryText: chatEntryText,
            imageId: imageId
        });
    } catch (e) {
        console.error("addChatEntry failed due to", e);
    }

    // Clear form
    event.target[0].value = "";

    // Clear image upload
    $('#chatEntryImagePreview').empty();
    $('#chatEntryImageUpload').val(null);

    // Resize form
    Stretchy.resize('#addChatEntryArea');
}

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
    },
    "click .delete-all-comments": function (event) {
        event.preventDefault();

        var timestampLimit = new Date();

        if (confirm("Möchten Sie wirklich alle Kommentare löschen?")) {
            var chatId = Router.current().params._id;

            Meteor.call("deleteAllChatComments", chatId, timestampLimit, function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });
        }
        // Prevent default form submit
        return false;
    }
});

Template.addChatEntry.events({
    "change #chatEntryImageUpload": function (event) {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var files = event.target.files;

            var target = $('#chatEntryImagePreview');
            target.empty();

            var file = files[0];
            if (!file.type.match('image.*')) {
                return;
            }

            var reader = new FileReader();
            reader.onload = (function (file) {
                return function (event) {
                    var clearButton = $('<button />', {
                        id: 'clearChatEntryImageUpload',
                        title: 'Bild entfernen',
                        class: 'btn btn-primary btn-raised no-margin'
                    });
                    clearButton.click(function () {
                        $('#chatEntryImageUpload').val(null);
                        target.empty();
                    });
                    clearButton.appendTo(target);

                    $('<i class="material-icons">delete_forever</i>').appendTo(clearButton);

                    var img = $('<img />', {
                        id: 'chatEntryImagePreviewImage',
                        class: 'img-responsive',
                        src: event.target.result
                    });
                    img.appendTo(target);
                };
            }(file));
            reader.readAsDataURL(file);
        } else {
            alert('Dieser Browser wird für den Bild-Upload nicht unterstützt.');
        }
    }
}) 