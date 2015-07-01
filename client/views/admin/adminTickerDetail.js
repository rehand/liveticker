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

Template.registerHelper("gameTime", function() {
    gameTimeDep.depend();

    serverOffset = serverOffset || 0;

    var gameTimeStr;
    if (this.timeSecondHalfEnd) {
        gameTimeStr = "Ende";
    } else if (this.timeSecondHalfStart) {
        var min = getMinute(this.timeSecondHalfStart, 45);
        if (min > 90) {
            gameTimeStr = "90. Minute + " + (min - 90);
        } else {
            gameTimeStr = min + ". Minute";
        }
    } else if (this.timeFirstHalfEnd) {
        gameTimeStr = "Pause";
    } else if (this.timeFirstHalfStart) {
        var min = getMinute(this.timeFirstHalfStart, 1);
        if (min > 45) {
            gameTimeStr = "45. Minute + " + (min - 45);
        } else {
            gameTimeStr = min + ". Minute";
        }
    } else {
        gameTimeStr = "Vorberichterstattung";
    }

    return gameTimeStr;
});

var getMinute = function (timeFrom, offset) {
    if (!serverOffset) {
        serverOffset = 0;
    }

    var currentTime = new Date().getTime();
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