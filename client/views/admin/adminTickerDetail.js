/**
 * Created by reini on 18.03.15.
 */

var timer;

Template.adminTickerDetail.created = function() {
    serverOffset = TimeSync.serverOffset();
    calcGameTime();
    timer = Meteor.setInterval(calcGameTime, 1000);

    Session.setDefault(SESSION_PLAY_AUDIO, false);
};

Template.adminTickerDetail.rendered = function () {
    $('.add-ticker-entry textarea').keypress(function (e) {
        if (e.which == 13) {
            $(e.target).parents('form').submit();
            e.preventDefault();
        }
    });

    $('form.substitutionEventForm').closest('div.modal').on('shown.bs.modal', function (event) {
        $(event.target).find('input[name="eventType"]').first().prop("checked", true);
    });
};

Template.adminTickerDetail.destroyed = function() {
    Meteor.clearInterval(timer);
};

Template.addTickerEntry.events({
    "submit .add-ticker-entry": function (event) {
        event.preventDefault();

        var tickerEntryText = event.target[0].value;
        var tickerId = Router.current().params._id;

        Meteor.call("addTickerEntry", {tickerId: tickerId, tickerEntryText: tickerEntryText}, function (error) {
            if (error) {
                console.error('error ' + error.reason);
                //throwError(error.reason);
            }
        });

        // Clear form
        event.target[0].value = "";

        // Resize form
        Stretchy.resizeAll('textarea');

        // Prevent default form submit
        return false;
    }
});

Template.tickerComment.events({
    "click .delete-comment": function (event) {
        return commentEvent(event, "deleteTickerComment");
    },
    "click .approve-comment": function (event) {
        return commentEvent(event, "approveTickerComment");
    }
});

var commentEvent = function (event, method) {
    event.preventDefault();

    var commentId = event.target.getAttribute('data-comment-id');
    var tickerId = Router.current().params._id;

    Meteor.call(method, tickerId, commentId, function (error) {
        if (error) {
            console.error('error ' + error.reason);
        }
    });

    // Prevent default form submit
    return false;
};

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

var mapFormation = function (formation) {
    return formation.map(function (entry) {
        return {
            label: entry.name,
            value: entry.id
        };
    });
};

var mapEventType = function (eventType) {
    return {
        label: eventType.charAt(0).toUpperCase() + eventType.slice(1).toLowerCase(),
        value: eventType
    };
};

var closeModal = function (event, template) {
    var formId = event.target.id;
    $('#' + formId).find('button.close').click();
};

var substitutionEventFilter = function (entry) {
    return entry.eventType == EVENT_TYPE_SUBSTITUTION
};

Template.addEvent.helpers({
    mapFormation: mapFormation,
    getEventTypes: function () {
        return EVENT_TYPES.map(mapEventType);
    }
});

Template.addEvent.events({
    "submit .addEventForm": closeModal
});

Template.addTeamEvent.helpers({
    mapTeams: function (ticker) {
        return [ticker.getHomeTeam(), ticker.getAwayTeam()].map(function (team) {
            return {
                label: team.name,
                value: team._id
            };
        });
    },
    getTeamEventTypes: function () {
        return [EVENT_TYPE_PENALTY].map(mapEventType);
    },
    getTeamDefaultEventType: function () {
        return EVENT_TYPE_PENALTY;
    }
});

Template.addTeamEvent.events({
    "submit .addTeamEventForm": closeModal
});

Template.addSubstitutionEvent.helpers({
    getSubstitutionEventTypes: function () {
        return [EVENT_TYPE_SUBSTITUTION].map(mapEventType);
    },
    getSubstitutionDefaultEventType: function () {
        return EVENT_TYPE_SUBSTITUTION;
    },
    mapPlayingFormation: function (formation, entries) {
        var substitutionEntries = entries.filter(substitutionEventFilter);

        var substitutedKickers = substitutionEntries.map(function (entry) {
            return entry.kicker[0].id;
        });

        var exchangedKickers = substitutionEntries.map(function (entry) {
            return entry.kicker[1].id;
        });

        return mapFormation(formation.filter(function (entry) {
            var isKickerStarting = entry.gamePosition !== POS_NA && entry.gamePosition !== POS_ERSATZBANK;
            var wasKickerSubstituted = substitutedKickers.indexOf(entry.id) !== -1;
            var wasKickerExchanged = exchangedKickers.indexOf(entry.id) !== -1;

            return (isKickerStarting || wasKickerExchanged) && !wasKickerSubstituted;
        }));
    },
    mapSubstitutionFormation: function (formation, entries) {
        var substitutionEntries = entries.filter(substitutionEventFilter);

        var exchangedKickers = substitutionEntries.map(function (entry) {
            return entry.kicker[1].id;
        });

        return mapFormation(formation.filter(function (entry) {
            var isKickerOnBench = entry.gamePosition === POS_ERSATZBANK;
            var wasKickerExchanged = exchangedKickers.indexOf(entry.id) !== -1;

            return isKickerOnBench && !wasKickerExchanged;
        }));
    }
});

Template.addSubstitutionEvent.events({
    "submit .substitutionEventForm": closeModal
});