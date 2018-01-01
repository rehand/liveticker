Template.frontendChatDetail.rendered = function () {
    setTimeout(function () {
        $("#matchInfo").sticky({topSpacing: 0, className: 'sticky', getWidthFrom: '#errors', responsiveWidth: true});
        $("#matchInfo").sticky('update');
    }, 2000);
};

Template.registerHelper("getCommentName", function() {
    return Session.get(SESSION_COMMENT_NAME);
});

var CHAT_COMMENTS_ALLOWED_AFTER_END_MILLIS = 8 * 60 * 1000;
var chatCommentsAllowedDep = new Deps.Dependency();
Template.registerHelper("allowChatComments", function () {
    var timeChatEnd = this.chat && this.chat.timeChatEnd ? this.chat.timeChatEnd : null;

    var timeoutReached;
    if (timeChatEnd && !(timeoutReached = (new Date().getTime() - timeChatEnd.getTime() > CHAT_COMMENTS_ALLOWED_AFTER_END_MILLIS))) {
        var timeout = CHAT_COMMENTS_ALLOWED_AFTER_END_MILLIS - (new Date().getTime() - timeChatEnd.getTime());
        if (timeout > 0) {
            chatCommentsAllowedDep.depend();

            setTimeout(function () {
                chatCommentsAllowedDep.changed();
            }, timeout);
        }
    }

    return !timeChatEnd || !timeoutReached;
});

AutoForm.hooks({
    addChatComment: {
        onSuccess: function (formType, newCommentName) {
            var currentCommentName = Session.get(SESSION_COMMENT_NAME);
            if (newCommentName && currentCommentName !== newCommentName) {
                Session.set(SESSION_COMMENT_NAME, newCommentName);
            }

            // repopulate form partially
            $('#' + this.formId).find('input[name="name"]').first().val(newCommentName);

            return true;
        }
    }
});