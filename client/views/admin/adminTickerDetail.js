/**
 * Created by reini on 18.03.15.
 */

var timer;

Template.adminTickerDetail.created = function() {
    serverOffset = TimeSync.serverOffset();
    calcGameTime();
    timer = Meteor.setInterval(calcGameTime, 1000);
};

Template.adminTickerDetail.destroyed = function() {
    Meteor.clearInterval(timer);
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

        if (confirm("Möchten Sie wirklich zur nächsten Spielphase wechseln?")) {
            var type = event.target.getAttribute('data-type');
            var tickerId = Router.current().params._id;

            Meteor.call("setTime", tickerId, type, function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });
        }

        return false;
    },
    "click .reset-time-button": function (event, template) {
        event.preventDefault();

        if (confirm("Möchten Sie wirklich in die vorherige Spielphase zurückkehren?")) {
            var type = event.target.getAttribute('data-type');
            var tickerId = Router.current().params._id;

            Meteor.call("resetTime", tickerId, type, function (error) {
                if (error) {
                    console.error('error ' + error.reason);
                }
            });
        }

        return false;
    }
});

Template.addEvent.helpers({
    mapFormation: function (formation) {
        return formation.map(function (entry) {
            return {
                label: entry.name,
                value: entry.id
            };
        });
    },
    getEventTypes: function () {
        return EVENT_TYPES.map(function (eventType) {
            return {
                label: eventType.charAt(0).toUpperCase() + eventType.slice(1).toLowerCase(),
                value: eventType
            };
        });
    }
});

Template.addEvent.events({
    "submit .addEventForm": function (event, template) {
        var formId = event.target.id;
        $('#' + formId).find('button.close').click();
    }
});