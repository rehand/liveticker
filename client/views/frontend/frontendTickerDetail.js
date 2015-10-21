var timer;

Template.frontendTickerDetail.created = function () {
    serverOffset = TimeSync.serverOffset();
    calcGameTime();
    timer = Meteor.setInterval(calcGameTime, 1000);

    Session.setDefault(SESSION_PLAY_AUDIO, true);
};

Template.frontendTickerDetail.rendered = function () {
    setTimeout(function () {
        $("#matchInfo").sticky({topSpacing: 0, className: 'sticky', getWidthFrom: '#errors', responsiveWidth: true});
        $("#matchInfo").sticky('update');
    }, 2000);
};

Template.frontendTickerDetail.destroyed = function () {
    Meteor.clearInterval(timer);
};

Template.registerHelper("getCommentName", function() {
    return Session.get(SESSION_COMMENT_NAME);
});

AutoForm.hooks({
    addTickerComment: {
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