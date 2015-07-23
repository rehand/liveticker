/**
 * Created by reini on 18.03.15.
 */
var timer;
var serverOffset;
var gameTimeDep = new Deps.Dependency();

var calcGameTime = function () {
    gameTimeDep.changed();
};

Template.adminTickerDetail.created = function() {
    serverOffset = TimeSync.serverOffset();
    calcGameTime();
    timer = Meteor.setInterval(calcGameTime, 1000);
};

Template.adminTickerDetail.destroyed = function() {
    Meteor.clearInterval(timer);
};

Template.registerHelper("entryTime", function() {
    var ticker = Template.parentData().ticker;
    return getGameTimeStr(ticker, this.timestamp);
});

Template.registerHelper("gameTime", function() {
    gameTimeDep.depend();

    if (!serverOffset) {
        serverOffset = 0;
    }

    return getGameTimeStr(this);
});

Template.registerHelper("reverse", function() {
    return [];
});

var getGameTimeStr = function (ticker, timeObj) {
    var timeFrom = timeObj;
    if (!timeFrom) {
        timeFrom = new Date();
    }
    timeFrom = timeFrom.getTime();

    var gameTimeStr;
    if (ticker.timeSecondHalfEnd && ticker.timeSecondHalfEnd.getTime() < timeFrom) {
        gameTimeStr = "Nachberichterstattung";
    } else if (ticker.timeSecondHalfStart && ticker.timeSecondHalfStart.getTime() < timeFrom) {
        var min = getMinute(ticker.timeSecondHalfStart, 45, timeFrom);
        if (min > 90) {
            gameTimeStr = "90. Minute + " + (min - 90);
        } else {
            gameTimeStr = min + ". Minute";
        }
    } else if (ticker.timeFirstHalfEnd && ticker.timeFirstHalfEnd.getTime() < timeFrom) {
        gameTimeStr = "Pause";
    } else if (ticker.timeFirstHalfStart && ticker.timeFirstHalfStart.getTime() < timeFrom) {
        var min = getMinute(ticker.timeFirstHalfStart, 1, timeFrom);
        if (min > 45) {
            gameTimeStr = "45. Minute + " + (min - 45);
        } else {
            gameTimeStr = min + ". Minute";
        }
    } else {
        gameTimeStr = "Vorberichterstattung";
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

Template.addTickerEntry.events({
    "submit .add-ticker-entry": function (event) {
        event.preventDefault();

        var tickerEntryText = event.target.text.value;
        var tickerId = Router.current().params._id;

        Meteor.call("addTickerEntry", {tickerId: tickerId, tickerEntryText: tickerEntryText}, function (error) {
            if (error) {
                console.error('error ' + error.reason);
                //throwError(error.reason);
            }
        });

        // Clear form
        event.target.text.value = "";

        // Prevent default form submit
        return false;
    }
});

Template.removeLastTickerEntry.events({
    "submit .remove-last-ticker-entry": function (event) {
        event.preventDefault();

        var tickerId = Router.current().params._id;

        Meteor.call("removeLastTickerEntry", tickerId, function(error) {
            if (error) {
                console.error('error ' + error.reason);
                //throwError(error.reason);
            }
        });

        // Prevent default form submit
        return false;
    }
});

Template.adminTickerDetail.events({
    "click .score-button": function (event, template) {
        event.preventDefault();

        var type = event.target.getAttribute('data-type');

        var isHomeScore = type.indexOf("home") > -1;
        var value = ~type.indexOf("+") ? 1 : -1;

        var currentScore = isHomeScore ? template.data.ticker.scoreHome : template.data.ticker.scoreAway;

        if (value > 0 || currentScore + value >= 0) {
            var tickerId = Router.current().params._id;

            Meteor.call("changeScore", tickerId, isHomeScore, value, function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });
        }

        return false;
    },
    "click .time-button": function (event, template) {
        event.preventDefault();

        var type = event.target.getAttribute('data-type');
        var tickerId = Router.current().params._id;

        Meteor.call("setTime", tickerId, type, function (error) {
            if (error) {
                console.error('error ' + error.reason);
            }
        });

        return false;
    },
    "click .reset-time-button": function (event, template) {
        event.preventDefault();

        var type = event.target.getAttribute('data-type');
        var tickerId = Router.current().params._id;

        Meteor.call("resetTime", tickerId, type, function (error) {
            if (error) {
                console.error('error ' + error.reason);
            }
        });

        return false;
    }
});