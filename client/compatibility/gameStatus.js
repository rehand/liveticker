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
    if (ticker.timeSecondHalfEnd && ticker.timeSecondHalfEnd.getTime() < timeFrom) {
        gameTimeStr = "Nachbericht";
    } else if (ticker.timeSecondHalfStart && ticker.timeSecondHalfStart.getTime() < timeFrom) {
        var min = getMinute(ticker.timeSecondHalfStart, 46, timeFrom);
        if (min > 90) {
            gameTimeStr = "90. Minute + " + (min - 90);
        } else {
            gameTimeStr = min + ". Minute";
        }
    } else if (ticker.timeFirstHalfEnd && ticker.timeFirstHalfEnd.getTime() < timeFrom) {
        gameTimeStr = "Halbzeit";
    } else if (ticker.timeFirstHalfStart && ticker.timeFirstHalfStart.getTime() < timeFrom) {
        var min = getMinute(ticker.timeFirstHalfStart, 1, timeFrom);
        if (min > 45) {
            gameTimeStr = "45. Minute + " + (min - 45);
        } else {
            gameTimeStr = min + ". Minute";
        }
    } else {
        gameTimeStr = "Vorbericht";
    }

    return gameTimeStr;
};

var getMinute = function (timeFrom, offset, timeObj) {
    if (!serverOffset) {
        serverOffset = 0;
    }

    var currentTime = timeObj;

    var timeFirstHalfStart = timeFrom.getTime();
    var result = (currentTime - timeFirstHalfStart - serverOffset) / 60000;
    result = ~~result;

    return offset + result;
};