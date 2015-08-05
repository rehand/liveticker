Template.tickerEntry.helpers({
    isTextEntry: function (eventType) {
        return eventType === EVENT_TYPE_TEXT;
    },
    isGoalEntry: function (eventType) {
        return eventType === EVENT_TYPE_GOAL;
    },
    isOwnGoalEntry: function (eventType) {
        return eventType === EVENT_TYPE_OWN_GOAL;
    },
    isPenaltyEntry: function (eventType) {
        return eventType === EVENT_TYPE_PENALTY;
    },
    isYellowEntry: function (eventType) {
        return eventType === EVENT_TYPE_YELLOW_CARD;
    },
    isYellowRedEntry: function (eventType) {
        return eventType === EVENT_TYPE_YELLOW_RED_CARD;
    },
    isRedEntry: function (eventType) {
        return eventType === EVENT_TYPE_RED_CARD;
    }
});