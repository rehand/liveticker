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
        }

        if (kickerId in kickersYellowRed) {
            kicker.yellowRedCard = kickersYellowRed[kickerId];
        }

        if (kickerId in kickersYellow) {
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

drawLogos = function (context, ticker, maxLogoWidth, maxLogoHeight, yPosLogo, xPosLogoHome, xPosLogoAway) {
    var drawLogo = function (context, logo, xPosLogo) {
        var ratio = Math.min(1, maxLogoHeight / logo.height, maxLogoWidth / logo.width);

        var width = logo.width * ratio;
        var height = logo.height * ratio;

        context.drawImage(logo, xPosLogo + (maxLogoWidth - width) / 2, yPosLogo - height, width, height);
    };

    var logoHome = new Image();
    logoHome.onload = function () {
        drawLogo(context, logoHome, xPosLogoHome);
    };
    logoHome.src = ticker.getHomeTeam().getLogo().url();

    var logoAway = new Image();
    logoAway.onload = function () {
        drawLogo(context, logoAway, xPosLogoAway);
    };
    logoAway.src = ticker.getAwayTeam().getLogo().url();
};

abbreviateKickerName = function (kickerName) {
    var kickerNameSplit = kickerName.split(' ');

    if (kickerNameSplit.length > 1) {
        return kickerNameSplit[0].charAt(0) + '. ' + kickerNameSplit[kickerNameSplit.length - 1];
    }

    return kickerName;
};

playAnthem = function (entry, anthemSource) {
    var anthemsPlayed = Session.get(SESSION_ANTHEMS_PLAYED);

    if (!Array.isArray(anthemsPlayed)) {
        anthemsPlayed = [];
    }

    if (anthemsPlayed.indexOf(entry.timestamp.getTime()) === -1) {
        // store timestamp so that we know, that for this event the anthem was played
        anthemsPlayed.push(entry.timestamp.getTime());
        Session.set(SESSION_ANTHEMS_PLAYED, anthemsPlayed);

        // play anthem
        var anthemAudio = new Howl({
            src: [anthemSource]
        });
        anthemAudio.play();
    }
};