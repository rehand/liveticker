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

var COMMENTS_ALLOWED_AFTER_END_MILLIS = 8 * 60 * 1000;
var commentsAllowedDep = new Deps.Dependency();
Template.registerHelper("allowComments", function () {
    var timeSecondHalfEnd = this.ticker.timeSecondHalfEnd;

    var timeoutReached;
    if (timeSecondHalfEnd && !(timeoutReached = (new Date().getTime() - timeSecondHalfEnd.getTime() > COMMENTS_ALLOWED_AFTER_END_MILLIS))) {
        var timeout = COMMENTS_ALLOWED_AFTER_END_MILLIS - (new Date().getTime() - timeSecondHalfEnd.getTime());
        if (timeout > 0) {
            commentsAllowedDep.depend();

            setTimeout(function () {
                commentsAllowedDep.changed();
            }, timeout);
        }
    }

    return !timeSecondHalfEnd || !timeoutReached;
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