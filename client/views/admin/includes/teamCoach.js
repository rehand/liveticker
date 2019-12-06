Template.teamCoach.helpers({
    showCoach: function (ticker) {
        var showCoachIfTickerAfterDate = new Date('2018-01-01');
        return ticker && ticker.createdAt >= showCoachIfTickerAfterDate;
    },
    getCoachEventTypes: function () {
        return [EVENT_TYPE_YELLOW_CARD, EVENT_TYPE_YELLOW_RED_CARD, EVENT_TYPE_RED_CARD].map(mapEventType);
    },
    getCoachDefaultEventType: function () {
        return EVENT_TYPE_YELLOW_CARD;
    },
    getCoachEvents: function(team) {
        var entries = [];
        if (this.tickerEntries) {
            entries = this.tickerEntries.fetch();
        }

        return mapCoachEvents(team, entries);
    }
});

Template.teamCoach.events({
    "submit .addCoachEventForm": closeModal
});