/**
 * Created by reini on 20.04.16.
 */

var fontSize = 24;

var maxTextLength = 150;

var getTextWitdh = function (context, text, bold, tmpFontSize) {
    if (bold) {
        context.font = "bold " + (tmpFontSize ? tmpFontSize : fontSize) + "px FuturaEFME-Bold";
    } else {
        context.font = (tmpFontSize ? tmpFontSize : fontSize) + "px FuturaEFME-Book";
    }

    return context.measureText(text).width;
};

var drawText = function (context, textAlign, text, xPos, yPos, bold, tmpFontSize) {
    context.textAlign = textAlign;
    if (bold) {
        context.font = "bold " + (tmpFontSize ? tmpFontSize : fontSize) + "px FuturaEFME-Bold";
    } else {
        context.font = (tmpFontSize ? tmpFontSize : fontSize) + "px FuturaEFME-Book";
    }

    context.fillText(text, xPos, yPos);
};

var GOAL_EVENT_TYPES = [EVENT_TYPE_GOAL, EVENT_TYPE_OWN_GOAL, EVENT_TYPE_PENALTY_GOAL];
filterGoalEvents = function (formationEntry) {
    return GOAL_EVENT_TYPES.indexOf(formationEntry.eventType) !== -1 && !formationEntry.varEventId;
};

var abbreviateKickerName = function (kickerName) {
    var kickerNameSplit = kickerName.split(' ');
    if (kickerNameSplit.length > 1) {
        return kickerNameSplit[0].charAt(0) + '. ' + kickerNameSplit[kickerNameSplit.length - 1];
    }

    return kickerName;
};

var drawEventTime = function (context, ticker, timestamp, x, y) {

    var minuteStr = getGameTimeMinStr(ticker, timestamp);
    if (minuteStr) {
        context.font = fontSize + "px FuturaEFME-Book";
        context.fillText('(' + minuteStr + '.)', x, y);
    }
};

Template.adminTickerExportStatistics.created = function () {
    serverOffset = TimeSync.serverOffset();
};

function drawGoalEntry(context, xCenter, yPos, goalText, header, maxWidth) {
    var headerWidth = 0;
    if (header && header.length > 0) {
        headerWidth = getTextWitdh(context, header, true);
    }

    var textWidth;
    var tmpFontSize = fontSize;
    while ((textWidth = getTextWitdh(context, goalText, false, tmpFontSize)) + headerWidth > maxWidth && tmpFontSize > 1) {
        tmpFontSize --;
    }

    if (headerWidth > 0) {
        drawText(context, "center", header, xCenter - textWidth / 2, yPos, true);
    }

    drawText(context, "center", goalText, xCenter + headerWidth / 2, yPos, false, tmpFontSize);
}
function getGoalText(goalEntry, ticker, goalsHome, goalsAway) {
    var homeScored = goalEntry.teamId === ticker.teamHome;
    homeScored = goalEntry.eventType === EVENT_TYPE_OWN_GOAL ? !homeScored : homeScored;
    if (homeScored) {
        goalsHome++;
    } else {
        goalsAway++;
    }

    var goalText = goalsHome + ":" + goalsAway + " " + abbreviateKickerName(goalEntry.kicker[0].name);
    var minuteStr = getGameTimeMinStr(ticker, goalEntry.timestamp);
    if (minuteStr) {
        goalText += " (" + minuteStr + ")";
    }
    return {
        goalsHome: goalsHome,
        goalsAway: goalsAway,
        goalText: goalText
    };
}
function generateImage(ticker) {
    var context = $('#statisticsExport').get(0).getContext('2d');

    var tickerEntries = TickerEntries.find().fetch();
    var background = new Image();
    background.onload = function () {

        context.drawImage(background, 0, 0);
        var maxLogoWidth = 120;
        var maxLogoHeight = 120;
        var yPosLogo = 386;
        var xPosLogoHome = 97;
        var xPosLogoAway = 591;

        drawLogos(context, ticker, maxLogoWidth, maxLogoHeight, yPosLogo, xPosLogoHome, xPosLogoAway);
        function drawStatistic(index, number, textAlign, xText) {
            // don't draw more than 10 statistics
            if (index > 9) {
                return;
            }

            context.textAlign = textAlign;
            context.font = "bold " + fontSize + "px FuturaEFME-Bold";
            var yText = 386 + index * 40 + 9 + fontSize;

            context.fillText(number, xText, yText);
            context.textAlign = "left";
        }

        var leftPos = 142;

        var rightPos = 658;
        // draw goals
        var indexGoals = 0;
        drawStatistic(indexGoals, ticker.scoreHome, "left", leftPos);

        drawStatistic(indexGoals, ticker.scoreAway, "right", rightPos);
        var inputFields = [
            "shots",
            "shotsOnGoal",
            "possession",
            "duelSuccess",
            "passSuccess",
            "centers",
            "corners",
            "fouls",
            "offsides"
        ];

        var inputFieldsIndexOffset = 1;

        inputFields.forEach(function (field, index) {
            var inputFields = $("input[name='" + field + "']");

            var valueHome = 0;
            if (inputFields.length > 0) {
                valueHome = inputFields.first().val();
            }
            drawStatistic(index + inputFieldsIndexOffset, valueHome, "left", leftPos);

            var valueAway = 0;
            if (inputFields.length > 1) {
                valueAway = inputFields.last().val();
            }
            drawStatistic(index + inputFieldsIndexOffset, valueAway, "right", rightPos);
        });

        var xCenter = 400;
        var kickOffDateString = ticker.kickoff.toLocaleString("de-DE", {
            weekday: 'long',
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
        });
        if (kickOffDateString) {
            drawText(context, "center", kickOffDateString + " Uhr", xCenter, 180, true);
        }

        var stadium = $("input[name='stadium']").val();
        var viewers = $("input[name='viewers']").val();
        var stadiumViewersText;
        if (viewers && viewers > 0) {
            stadiumViewersText = parseInt(viewers).toLocaleString("de-DE") + " Zuschauer";
        }
        if (stadium && stadium.length > 0) {
            stadiumViewersText = stadium + ", " + stadiumViewersText;
        }
        if (stadiumViewersText) {
            drawText(context, "center", stadiumViewersText, xCenter, 208, true);
        }

        if (ticker.getReferee()) {
            var header = "SR: ";
            drawText(context, "center", header, xCenter - getTextWitdh(context, ticker.getReferee(), false)/2, 236, true);
            drawText(context, "center", ticker.getReferee(), xCenter + getTextWitdh(context, header, true)/2, 236, false);
        }

        var goals = tickerEntries.filter(filterGoalEvents).sort(function (entry1, entry2) {
            return entry1.timestamp.getTime() - entry2.timestamp.getTime();
        });

        var goalCnt = Math.min(goals.length, 11); // display max. 11 goal entries
        if (goalCnt > 0) {
            var yOffset = 25;
            var maxTextWidth = 365;
            var header = goalCnt > 1 ? "Tore: " : "Tor: ";
            var yPos = goalCnt > 3 ? 264 : 292;

            var goalsHome = 0;
            var goalsAway = 0;

            for (var i = 0; i < goalCnt; i++) {
                var goalEntry = goals[i];
                var __ret = getGoalText(goalEntry, ticker, goalsHome, goalsAway);
                goalsHome = __ret.goalsHome;
                goalsAway = __ret.goalsAway;
                var goalText = __ret.goalText;
                if (i !== goalCnt - 1) {
                    goalText += ",";
                }

                if (goalCnt <= 6 || i === 0) {
                    drawGoalEntry(context, xCenter, yPos + i * yOffset, goalText, i === 0 ? header : undefined, maxTextWidth);
                } else {
                    i++;
                    if (i < goalCnt) {
                        goalEntry = goals[i];
                        var __ret = getGoalText(goalEntry, ticker, goalsHome, goalsAway);
                        goalsHome = __ret.goalsHome;
                        goalsAway = __ret.goalsAway;
                        goalText += " " + __ret.goalText;
                        if (i !== goalCnt - 1) {
                            goalText += ",";
                        }
                    }

                    drawGoalEntry(context, xCenter, yPos + (i / 2) * yOffset, goalText, i === 0 ? header : undefined, maxTextWidth);
                }
            }
        }
    };
    background.src = STATISTICS_EXPORT_BACKGROUND;
}

Template.adminTickerExportStatistics.onRendered(function () {
    generateImage(this.data.ticker);
});

Template.adminTickerExportStatistics.events({
    "click .back-button": function (event) {
        event.preventDefault();

        Router.go('adminTickerDetail', {_id: Router.current().params._id});

        // Prevent default form submit
        return false;
    },
    "click .download-button": function (event) {
        var dt = $('#statisticsExport').get(0).toDataURL('image/png');

        event.target.setAttribute("download", this.ticker.kickoff.toISOString().substring(0, 10) + "_" + this.ticker.getHomeTeam().name + " - " + this.ticker.getAwayTeam().name + " - Statistiken.png");

        event.target.href = dt;
    },
    "click .refresh": function (event) {
        event.preventDefault();

        generateImage(this.ticker);

        return false;
    }
});