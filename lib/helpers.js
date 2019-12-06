sortFormation = function (formation, onlyPosition) {
    var offset = POSITIONS.length;

    var getValue = function (value) {
        var pos;

        if (onlyPosition) {
            pos = POSITIONS.indexOf(value.position);
        } else {
            pos = POSITIONS.indexOf(value.gamePosition);

            if (pos < 0) {
                pos = POSITIONS.indexOf(value.position);
                if (pos >= 0) {
                    var number = value.number;
                    if (!number) {
                        number = 0;
                    }
                    pos = offset + pos * 1000 + number;
                }
            }
        }

        return pos < 0 ? Number.MAX_VALUE : (1 + pos);
    };

    return ensureArray(formation).sort(function (value1, value2) {
        return getValue(value1) - getValue(value2);
    });
};

substitutionEventFilter = function (entry) {
    return entry.eventType == EVENT_TYPE_SUBSTITUTION
};

mapVotableKickers = function (formation, entries, coachVoting, coachId, coach) {
    var substitutionEntries = entries.fetch().filter(substitutionEventFilter);

    var exchangedKickers = substitutionEntries.map(function (entry) {
        return entry.kicker[1].id;
    });

    var tmpFormation = formation.slice();
    if (coachVoting && coach) {
        tmpFormation.push({
            gamePosition: 'Trainer',
            id: coachId,
            name: coach.name
        });
    }

    return sortFormation(ensureArray(tmpFormation).filter(function (entry) {
        var isKickerStarting = entry.gamePosition !== POS_NA && entry.gamePosition !== POS_ERSATZBANK;
        var wasKickerExchanged = exchangedKickers.indexOf(entry.id) !== -1;

        return isKickerStarting || wasKickerExchanged;
    }), false);
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

var EVENT_TYPES_TO_FILTER = EVENT_TYPES.concat(EVENT_TYPE_SUBSTITUTION).concat(EVENT_TYPES_OVERTIME_PENALTY);

ensureArray = function (value) {
    if (!value || !Array.isArray(value)) {
        return [];
    }
    return value;
};

populateFormation = function (formation, tickerEntries) {
    var eventEntries = tickerEntries.filter(function (entry) {
        return EVENT_TYPES_TO_FILTER.indexOf(entry.eventType) !== -1 && entry.kicker.length;
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

    var kickersOvertimePenaltyConverted = eventEntries.filter(function (entry) {
        return entry.eventType === EVENT_TYPE_OVERTIME_PENALTY_CONVERTED;
    }).reduce(mapFirstKicker, {});

    var kickersOvertimePenaltyMissed = eventEntries.filter(function (entry) {
        return entry.eventType === EVENT_TYPE_OVERTIME_PENALTY_MISSED;
    }).reduce(mapFirstKicker, {});

    return ensureArray(formation).map(function (kicker) {
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

        if (kickerId in kickersOvertimePenaltyConverted) {
            kicker.overtimePenaltyConverted = kickersOvertimePenaltyConverted[kickerId];
        }

        if (kickerId in kickersOvertimePenaltyMissed) {
            kicker.overtimePenaltyMissed = kickersOvertimePenaltyMissed[kickerId];
        }

        return kicker;
    });
};

mapCoachEvents = function(team, entries) {
    var coachEvents = entries.filter(function(entry) {
        return entry.teamId === team._id && (!Array.isArray(entry.kicker) || !entry.kicker.length);
    });

    var yellow = coachEvents.find(function (entry) {
        return entry.eventType === EVENT_TYPE_YELLOW_CARD;
    });

    var yellowRed = coachEvents.find(function (entry) {
        return entry.eventType === EVENT_TYPE_YELLOW_RED_CARD;
    });

    var red = coachEvents.find(function (entry) {
        return entry.eventType === EVENT_TYPE_RED_CARD;
    });

    return {
        yellowCard: yellow ? yellow.timestamp : undefined,
        yellowRedCard: yellowRed ? yellowRed.timestamp :  undefined,
        redCard: red ? red.timestamp : undefined
    };
}

getGameTimeMinStr = function (ticker, timeObj) {
    var timeFrom = timeObj;
    if (!timeFrom) {
        timeFrom = new Date();
    }
    timeFrom = timeFrom.getTime();

    var gameTimeMinStr;
    if (ticker.penaltyShootOutEnd && ticker.penaltyShootOutEnd.getTime() < timeFrom) {
        gameTimeMinStr = null;
    } else if (ticker.penaltyShootOutStart && ticker.penaltyShootOutStart.getTime() < timeFrom) {
        gameTimeMinStr = null;
    } else if (ticker.extraTimeSecondHalfEnd && ticker.extraTimeSecondHalfEnd.getTime() < timeFrom) {
        gameTimeMinStr = null;
    } else if (ticker.extraTimeSecondHalfStart && ticker.extraTimeSecondHalfStart.getTime() < timeFrom) {
        gameTimeMinStr = getMinuteStr(ticker.extraTimeSecondHalfStart, 106, 120, timeFrom, ".", "+");
    } else if (ticker.extraTimeFirstHalfEnd && ticker.extraTimeFirstHalfEnd.getTime() < timeFrom) {
        gameTimeMinStr = "106.";
    } else if (ticker.extraTimeFirstHalfStart && ticker.extraTimeFirstHalfStart.getTime() < timeFrom) {
        gameTimeMinStr = getMinuteStr(ticker.extraTimeFirstHalfStart, 91, 105, timeFrom, ".", "+");
    } else if (ticker.extraTimeStart && ticker.extraTimeStart.getTime() < timeFrom) {
        gameTimeMinStr = "91.";
    } else if (ticker.timeSecondHalfEnd && ticker.timeSecondHalfEnd.getTime() < timeFrom) {
        gameTimeMinStr = null;
    } else if (ticker.timeSecondHalfStart && ticker.timeSecondHalfStart.getTime() < timeFrom) {
        gameTimeMinStr = getMinuteStr(ticker.timeSecondHalfStart, 46, 90, timeFrom, ".", "+");
    } else if (ticker.timeFirstHalfEnd && ticker.timeFirstHalfEnd.getTime() < timeFrom) {
        gameTimeMinStr = "46.";
    } else if (ticker.timeFirstHalfStart && ticker.timeFirstHalfStart.getTime() < timeFrom) {
        gameTimeMinStr = getMinuteStr(ticker.timeFirstHalfStart, 1, 45, timeFrom, ".", "+");
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

sortReverse = function (entries) {
    if (!entries || !Array.isArray(entries)) {
        return entries;
    }

    return entries.reverse();
};

mapEventType = function (eventType) {
    return {
        label: eventType.charAt(0).toUpperCase() + eventType.slice(1).toLowerCase(),
        value: eventType
    };
};

closeModal = function (event, template) {
    var formId = event.target.id;
    $('#' + formId).find('button.close').click();
};