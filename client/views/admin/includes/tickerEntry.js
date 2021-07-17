var isGoalEntry = function (event) {
    return event.eventType === EVENT_TYPE_GOAL;
};

var isOwnGoalEntry = function (event) {
    return event.eventType === EVENT_TYPE_OWN_GOAL;
};

Template.tickerEntry.helpers({
    isTextEntry: function (entry) {
        return (entry ? entry : this).eventType === EVENT_TYPE_TEXT;
    },
    isGoalEntry: function () {
        return isGoalEntry(this);
    },
    isOwnGoalEntry: function () {
        return isOwnGoalEntry(this);
    },
    isGoalOrOwnGoalEntry: function () {
        return isGoalEntry(this) || isOwnGoalEntry(this);
    },
    hasVarEvent: function () {
        return !!this.varEventId;
    },
    isVarNoGoalEntry: function () {
        return this.eventType === EVENT_TYPE_VAR_NO_GOAL;
    },
    isPenaltyGoalEntry: function () {
        return this.eventType == EVENT_TYPE_PENALTY_GOAL;
    },
    isPenaltyEntry: function () {
        return this.eventType === EVENT_TYPE_PENALTY;
    },
    isYellowEntry: function () {
        return this.eventType === EVENT_TYPE_YELLOW_CARD;
    },
    isYellowRedEntry: function () {
        return this.eventType === EVENT_TYPE_YELLOW_RED_CARD;
    },
    isRedEntry: function () {
        return this.eventType === EVENT_TYPE_RED_CARD;
    },
    isSubstitutionEntry: function () {
        return this.eventType === EVENT_TYPE_SUBSTITUTION;
    },
    isCommentEntry: function () {
        return this.eventType === EVENT_TYPE_COMMENT;
    },
    isOvertimePenaltyEntry: function () {
        return EVENT_TYPES_OVERTIME_PENALTY.indexOf(this.eventType) >= 0;
    },
    isOvertimePenaltyConverted: function () {
        return this.eventType === EVENT_TYPE_OVERTIME_PENALTY_CONVERTED;
    },
    isOvertimePenaltyMissed: function () {
        return this.eventType === EVENT_TYPE_OVERTIME_PENALTY_MISSED;
    },
    getTeamName: function () {
        return Teams.findOne(this.teamId).name;
    },
    getTeamCode: function () {
        return Teams.findOne(this.teamId).code;
    },
    getTeamCoach: function () {
        return Teams.findOne(this.teamId).getCoach();
    },
    isCurrentEntry: function () {
        var currentDate = new Date();
        var diff = currentDate - this.timestamp;

        if (diff <= 10000 && !this.goalPlayed) {
            this.goalPlayed = true;
            return true;
        }

        return false;
    },
    hasGoalText: function () {
        return !!Teams.findOne(this.teamId).goalText;
    },
    getGoalText: function () {
        return Teams.findOne(this.teamId).goalText;
    },
    hasAnthem: function () {
        return !!Teams.findOne(this.teamId).anthem;
    },
    playTeamAnthem: function () {
        playAnthem(this, Teams.findOne(this.teamId).getAnthemPath());
    },
    playAudio: function () {
        return Session.get(SESSION_PLAY_AUDIO);
    },
    getMinuteClasses: function () {
        if (this.showButtons) {
            return "col-xs-12 col-sm-3";
        } else {
            return "col-xs-12 col-sm-2";
        }
    },
    getEntryClasses: function () {
        if (this.showButtons) {
            return "col-xs-offset-1 col-xs-11 col-sm-offset-0 col-sm-9";
        } else {
            return "col-xs-offset-1 col-xs-11 col-sm-offset-0 col-sm-10";
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

Template.adminTickerDetail.events({
    "click .delete-entry": function (event, template) {
        event.preventDefault();

        var entryId = event.target.getAttribute('data-entry-id');
        if (!entryId) {
            entryId = event.target.parentNode.getAttribute('data-entry-id');
        }

        if (confirm("Möchten Sie den Eintrag wirklich unwiderruflich löschen?")) {
            var tickerId = Router.current().params._id;

            Meteor.call("deleteTickerEntry", tickerId, entryId, function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });
        }

        return false;
    },
    "click .edit-entry": function (event, template) {
        var editDialog = $('#editTickerEntry');

        var entryId = this.entry.id;
        editDialog.find('input[name="entryId"]').first().val(entryId);

        var text = this.entry.text;
        editDialog.find('textarea[name="text"]').first().val(text);

        var entryTimestamp = new Date(this.entry.timestamp.getTime() - (this.entry.timestamp.getTimezoneOffset() * 60000)).toISOString().slice(0, -1);
        editDialog.find('input[name="entryTimestamp"]').first().val(entryTimestamp);

        return true;
    },
    "click .var-no-goal-entry": function (event, template) {
        event.preventDefault();

        var entryId = event.target.getAttribute('data-entry-id');
        if (!entryId) {
            entryId = event.target.parentNode.getAttribute('data-entry-id');
        }

        if (confirm("Möchten Sie das Tor wirklich vom VAR zurücknehmen lassen?")) {
            var tickerId = Router.current().params._id;

            Meteor.call("varNoGoalEntry", tickerId, entryId, function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });
        }

        return false;
    }
});

Template.editTickerEntry.rendered = function () {
    $('#editTickerEntry').on('shown.bs.modal', function (event) {
        Stretchy.resizeAll('textarea');
        $('#editTickerEntry').find('textarea[name="text"]').first().focus();
    });

    // register enter key to submit form
    $('.edit-ticker-entry textarea').keypress(function (e) {
        if (e.which == 13) {
            $(e.target).parents('form').submit();
            e.preventDefault();
        }
    });
};

Template.editTickerEntry.events({
    "submit .edit-ticker-entry": function (event) {
        event.preventDefault();

        var target = $(event.target);

        var tickerId = Router.current().params._id;
        var entryId = target.find('input[name="entryId"]').first().val();
        var tickerEntryText = target.find('textarea[name="text"]').first();
        var entryTimestamp = new Date(target.find('input[name="entryTimestamp"]').first().val());
        if (!entryTimestamp) {
            console.error("Invalid date: ", entryTimestamp);
        }

        Meteor.call("editTickerEntry", tickerId, entryId, tickerEntryText.val(), entryTimestamp,
            function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });

        // Clear form
        tickerEntryText.val('');

        // Close modal
        target.find('button.close').click();

        // Prevent default form submit
        return false;
    }
});