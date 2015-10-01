Template.tickerEntry.helpers({
    isTextEntry: function () {
        return this.eventType === EVENT_TYPE_TEXT;
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
        var anthemSturmGraz = new Howl({
            src: [TEAM_ANTHEM_STURM_GRAZ]
        });
        anthemSturmGraz.play();
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

        if (confirm("Möchten Sie den Eintrag wirklich unwiderruflich löschen?")) {
            var tickerId = Router.current().params._id;

            Meteor.call("deleteTickerEntry", tickerId, entryId, function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });
        }

        return false;
    }
});