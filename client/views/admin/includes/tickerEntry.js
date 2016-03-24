Template.tickerEntry.helpers({
    isTextEntry: function (entry) {
        return (entry ? entry : this).eventType === EVENT_TYPE_TEXT;
    },
    isGoalEntry: function () {
        return this.eventType === EVENT_TYPE_GOAL;
    },
    isOwnGoalEntry: function () {
        return this.eventType === EVENT_TYPE_OWN_GOAL;
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
    getTeamName: function () {
        return Teams.findOne(this.teamId).name;
    },
    getTeamCode: function () {
        return Teams.findOne(this.teamId).code;
    },
    isSturmGraz: function () {
        return Teams.findOne(this.teamId).code === TEAM_CODE_STURM_GRAZ;
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
    playAnthemSturmGraz: function () {
        var anthemsPlayed = Session.get(SESSION_ANTHEMS_PLAYED);

        if (!Array.isArray(anthemsPlayed)) {
            anthemsPlayed = [];
        }

        if (anthemsPlayed.indexOf(this.timestamp.getTime()) === -1) {
            // store timestamp so that we know, that for this event the anthem was played
            anthemsPlayed.push(this.timestamp.getTime());
            Session.set(SESSION_ANTHEMS_PLAYED, anthemsPlayed);

            // play anthem
            var anthemSturmGraz = new Howl({
                src: [TEAM_ANTHEM_STURM_GRAZ]
            });
            anthemSturmGraz.play();
        }
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

        return true;
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

        Meteor.call("editTickerEntry", tickerId, entryId, tickerEntryText.val(),
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