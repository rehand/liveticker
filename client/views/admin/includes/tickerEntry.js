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
    getTeamName: function () {
        return Teams.findOne(this.teamId).name;
    },
    getTeamCode: function () {
        return Teams.findOne(this.teamId).code;
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