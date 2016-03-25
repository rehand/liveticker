var EVENT_TYPES_TO_FILTER = EVENT_TYPES.concat(EVENT_TYPE_SUBSTITUTION);

var substitutionEventFilter = function (entry) {
    return entry.eventType == EVENT_TYPE_SUBSTITUTION
};

var mapFirstKicker = function (entry) {
    return entry.kicker[0].id;
};

Template.tickerFormation.helpers({
    sortAndPopulateFormation: function (formation) {
        var eventEntries = this.tickerEntries.fetch().filter(function (entry) {
            return EVENT_TYPES_TO_FILTER.indexOf(entry.eventType) !== -1;
        });

        var substitutionEntries = eventEntries.filter(substitutionEventFilter);

        var substitutedKickers = substitutionEntries.map(mapFirstKicker);

        var exchangedKickers = substitutionEntries.map(function (entry) {
            return entry.kicker[1].id;
        });

        var kickersScored = eventEntries.filter(function (entry) {
            return entry.eventType === EVENT_TYPE_GOAL || entry.eventType === EVENT_TYPE_PENALTY_GOAL;
        }).map(mapFirstKicker);

        var kickersYellow = eventEntries.filter(function (entry) {
            return entry.eventType === EVENT_TYPE_YELLOW_CARD;
        }).map(mapFirstKicker);

        var kickersYellowRed = eventEntries.filter(function (entry) {
            return entry.eventType === EVENT_TYPE_YELLOW_RED_CARD;
        }).map(mapFirstKicker);

        var kickersRed = eventEntries.filter(function (entry) {
            return entry.eventType === EVENT_TYPE_RED_CARD;
        }).map(mapFirstKicker);

        return sortFormation(formation.map(function (kicker) {
            var kickerId = kicker.id;

            if (Array.isArray(substitutedKickers) && substitutedKickers.indexOf(kickerId) !== -1) {
                kicker.substituted = true;
            }

            if (Array.isArray(exchangedKickers) && exchangedKickers.indexOf(kickerId) !== -1) {
                kicker.exchanged = true;
            }

            if (Array.isArray(kickersScored) && kickersScored.indexOf(kickerId) !== -1) {
                kicker.scored = true;
                kicker.goals = kickersScored.filter(function (entry) {
                    return entry === kickerId;
                });
            }

            if (Array.isArray(kickersRed) && kickersRed.indexOf(kickerId) !== -1) {
                kicker.redCard = true;
            } else if (Array.isArray(kickersYellowRed) && kickersYellowRed.indexOf(kickerId) !== -1) {
                kicker.yellowRedCard = true;
            } else if (Array.isArray(kickersYellow) && kickersYellow.indexOf(kickerId) !== -1) {
                kicker.yellowCard = true;
            }

            return kicker;
        }), false);
    }
});

Template.tickerFormationEntry.helpers({
    isInFormation: function (position) {
        return position && position != POS_NA;
    }
});