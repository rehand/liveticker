sortFormation = function (formation, onlyPosition) {
    var offset = POSITIONS.length;
    var getValue = function (value) {
        var pos;

        if (onlyPosition) {
            pos = POSITIONS.indexOf(value.position);
        } else {
            pos = POSITIONS.indexOf(value.gamePosition);

            if (pos < 0) {
                pos = offset + POSITIONS.indexOf(value.position);
            }
        }

        return pos < 0 ? 9999 : 1 + pos;
    };

    return formation.sort(function (value1, value2) {
        return getValue(value1) - getValue(value2);
    });
};

var substitutionEventFilter = function (entry) {
    return entry.eventType == EVENT_TYPE_SUBSTITUTION
};

var mapKicker = function (idx, prev, entry) {
    if (Array.isArray(prev[entry.kicker[idx].id])) {
        prev[entry.kicker[idx].id].push(entry.timestamp);
    } else {
        prev[entry.kicker[idx].id] = [entry.timestamp];
    }

    return prev;
};

var mapFirstKicker = function (prev, entry) {
    return mapKicker(0, prev, entry);
};

var EVENT_TYPES_TO_FILTER = EVENT_TYPES.concat(EVENT_TYPE_SUBSTITUTION);

populateFormation = function (formation, tickerEntries) {
    var eventEntries = tickerEntries.filter(function (entry) {
        return EVENT_TYPES_TO_FILTER.indexOf(entry.eventType) !== -1;
    });

    var substitutionEntries = eventEntries.filter(substitutionEventFilter);

    var substitutedKickers = substitutionEntries.reduce(mapFirstKicker, {});

    var exchangedKickers = substitutionEntries.reduce(function (prev, entry) {
        return mapKicker(1, prev, entry);
    }, {});

    var kickersScored = eventEntries.filter(function (entry) {
        return entry.eventType === EVENT_TYPE_GOAL || entry.eventType === EVENT_TYPE_PENALTY_GOAL;
    }).reduce(mapFirstKicker, {});

    var kickersYellow = eventEntries.filter(function (entry) {
        return entry.eventType === EVENT_TYPE_YELLOW_CARD;
    }).reduce(mapFirstKicker, {});

    var kickersYellowRed = eventEntries.filter(function (entry) {
        return entry.eventType === EVENT_TYPE_YELLOW_RED_CARD;
    }).reduce(mapFirstKicker, {});

    var kickersRed = eventEntries.filter(function (entry) {
        return entry.eventType === EVENT_TYPE_RED_CARD;
    }).reduce(mapFirstKicker, {});

    return formation.map(function (kicker) {
        var kickerId = kicker.id;

        if (kickerId in substitutedKickers) {
            kicker.substituted = substitutedKickers[kickerId];
        }

        if (kickerId in exchangedKickers) {
            kicker.exchanged = exchangedKickers[kickerId];
        }

        if (kickerId in kickersScored) {
            kicker.scored = true;
            kicker.goals = kickersScored[kickerId];
        }

        if (kickerId in kickersRed) {
            kicker.redCard = kickersRed[kickerId];
        } else if (kickerId in kickersYellowRed) {
            kicker.yellowRedCard = kickersYellowRed[kickerId];
        } else if (kickerId in kickersYellow) {
            kicker.yellowCard = kickersYellow[kickerId];
        }

        return kicker;
    });
};

getGameTimeMinStr = function (ticker, timeObj) {
    var timeFrom = timeObj;
    if (!timeFrom) {
        timeFrom = new Date();
    }
    timeFrom = timeFrom.getTime();

    var gameTimeMinStr;
    if (ticker.timeSecondHalfEnd && ticker.timeSecondHalfEnd.getTime() < timeFrom) {
        gameTimeMinStr = null;
    } else if (ticker.timeSecondHalfStart && ticker.timeSecondHalfStart.getTime() < timeFrom) {
        gameTimeMinStr = getMinute(ticker.timeSecondHalfStart, 46, timeFrom);
    } else if (ticker.timeFirstHalfEnd && ticker.timeFirstHalfEnd.getTime() < timeFrom) {
        gameTimeMinStr = 46;
    } else if (ticker.timeFirstHalfStart && ticker.timeFirstHalfStart.getTime() < timeFrom) {
        gameTimeMinStr = getMinute(ticker.timeFirstHalfStart, 1, timeFrom);
        if (gameTimeMinStr > 45) {
            gameTimeMinStr = 45;
        }
    } else {
        gameTimeMinStr = null;
    }

    return gameTimeMinStr;
};