/**
 * Created by reini on 23.07.15.
 */

serverOffset = 0;
var gameTimeDep = new Deps.Dependency();

function calcGameTime() {
    gameTimeDep.changed();
}

Template.registerHelper("entryTime", function() {
    var ticker = Template.parentData(3).ticker;
    return getGameTimeStr(ticker, this.timestamp);
});

Template.registerHelper("gameTime", function() {
    gameTimeDep.depend();

    if (!serverOffset) {
        serverOffset = 0;
    }

    return getGameTimeStr(this);
});

var getGameTimeStr = function (ticker, timeObj) {
    var timeFrom = timeObj;
    if (!timeFrom) {
        timeFrom = new Date();
    }
    timeFrom = timeFrom.getTime();

    var gameTimeStr;
    if (ticker.penaltyShootOutEnd && ticker.penaltyShootOutEnd.getTime() < timeFrom) {
        gameTimeStr = "Nachbericht";
    } else if (ticker.penaltyShootOutStart && ticker.penaltyShootOutStart.getTime() < timeFrom) {
        gameTimeStr = "Elfmeterschießen";
    } else if (ticker.extraTimeSecondHalfEnd && ticker.extraTimeSecondHalfEnd.getTime() < timeFrom) {
        gameTimeStr = "Nachbericht";
    } else if (ticker.extraTimeSecondHalfStart && ticker.extraTimeSecondHalfStart.getTime() < timeFrom) {
        gameTimeStr = getMinuteStr(ticker.extraTimeSecondHalfStart, 106, 120, timeFrom);
    } else if (ticker.extraTimeFirstHalfEnd && ticker.extraTimeFirstHalfEnd.getTime() < timeFrom) {
        gameTimeStr = "Seitenwechsel";
    } else if (ticker.extraTimeFirstHalfStart && ticker.extraTimeFirstHalfStart.getTime() < timeFrom) {
        gameTimeStr = getMinuteStr(ticker.extraTimeFirstHalfStart, 91, 105, timeFrom);
    } else if (ticker.extraTimeStart && ticker.extraTimeStart.getTime() < timeFrom) {
        gameTimeStr = "Verlängerung";
    } else if (ticker.timeSecondHalfEnd && ticker.timeSecondHalfEnd.getTime() < timeFrom) {
        gameTimeStr = "Nachbericht";
    } else if (ticker.timeSecondHalfStart && ticker.timeSecondHalfStart.getTime() < timeFrom) {
        gameTimeStr = getMinuteStr(ticker.timeSecondHalfStart, 46, 90, timeFrom);
    } else if (ticker.timeFirstHalfEnd && ticker.timeFirstHalfEnd.getTime() < timeFrom) {
        gameTimeStr = "Halbzeit";
    } else if (ticker.timeFirstHalfStart && ticker.timeFirstHalfStart.getTime() < timeFrom) {
        gameTimeStr = getMinuteStr(ticker.timeFirstHalfStart, 1, 45, timeFrom);
    } else {
        gameTimeStr = "Vorbericht";
    }

    return gameTimeStr;
};

var getMinuteStr = function(timeFrom, offset, maxTime, timeObj, minuteText, maxText) {
    if (!minuteText) {
        minuteText = ". Minute";
    }
    if (!maxText) {
        maxText = " + ";
    }
    var min = getMinute(timeFrom, offset, timeObj);
    var minuteStr;
    if (min > maxTime) {
        minuteStr = maxTime + minuteText + maxText + (min - maxTime);
    } else {
        minuteStr = min + minuteText;
    }
    return minuteStr;
};

var getMinute = function (timeFrom, offset, currentTime) {
    if (!serverOffset) {
        serverOffset = 0;
    }

    var result = (currentTime - timeFrom.getTime() - serverOffset) / 60000;
    result = ~~result;

    return offset + result;
};