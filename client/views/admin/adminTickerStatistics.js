import Dygraph from 'dygraphs';

var addAnnotationIfPresent = function(annotations, additionalDates, timestamp, shortText, text) {
    if (timestamp) {
        additionalDates.push(timestamp);
        annotations.push({
            series: "Frontend",
            x: timestamp.toISOString(),
            shortText: shortText,
            text: text,
            height: 20
        });
    }
}

var graph;

var showChart = function(targetId, ticker, presences) {
    var limit = new Date(ticker.kickoff.getTime());
    var daysLimit = parseInt($('#statisticsDaysLimit').val());
    if (!daysLimit || isNaN(daysLimit) || daysLimit <= 0) {
        daysLimit = 3;
    }
    limit.setDate(limit.getDate() + daysLimit);

    var annotations = [];
    var additionalDates = [];

    addAnnotationIfPresent(annotations, additionalDates, ticker.createdAt, "*", "Ticker erstellt");
    addAnnotationIfPresent(annotations, additionalDates, ticker.kickoff, "K", "Kickoff");

    addAnnotationIfPresent(annotations, additionalDates, ticker.timeFirstHalfStart, "1", "Beginn 1. Halbzeit");
    addAnnotationIfPresent(annotations, additionalDates, ticker.timeFirstHalfEnd, "P", "Ende 1. Halbzeit");
    addAnnotationIfPresent(annotations, additionalDates, ticker.timeSecondHalfStart, "2", "Beginn 2. Halbzeit");
    addAnnotationIfPresent(annotations, additionalDates, ticker.timeSecondHalfEnd, "E", "Ende 2. Halbzeit");

    addAnnotationIfPresent(annotations, additionalDates, ticker.extraTimeFirstHalfStart, "1V", "Beginn 1. Halbzeit der Verlängerung");
    addAnnotationIfPresent(annotations, additionalDates, ticker.extraTimeFirstHalfEnd, "PV", "Ende 1. Halbzeit der Verlängerung");
    addAnnotationIfPresent(annotations, additionalDates, ticker.extraTimeSecondHalfStart, "2V", "Beginn 2. Halbzeit der Verlängerung");
    addAnnotationIfPresent(annotations, additionalDates, ticker.extraTimeSecondHalfEnd, "2E", "Ende 2. Halbzeit der Verlängerung");
    addAnnotationIfPresent(annotations, additionalDates, ticker.penaltyShootOutStart, "E1", "Beginn Elfmeterschießen");
    addAnnotationIfPresent(annotations, additionalDates, ticker.penaltyShootOutEnd, "EE", "Ende Elfmeterschießen");

    if (ticker.votings) {
        addAnnotationIfPresent(annotations, additionalDates, ticker.votingDeadline, "V", "Ende Spielerbewertung");
    }

    var interval = parseInt($('#statisticsInterval').val());
    if (!interval || isNaN(interval) || interval <= 0) {
        interval = 1;
    }

    var data = getChartData(presences, ticker.createdAt.getTime(), additionalDates, interval, limit.getTime());

    if (graph) {
        graph.updateOptions({
            'file': data
        });
        graph.setAnnotations(annotations);
    } else {
        graph = new Dygraph(
            document.getElementById(targetId),
            data, {
                ylabel: 'Benutzer',
                legend: 'follow',
                height: 500,
                showRangeSelector: true
            }
        );

        graph.ready(function() {
            graph.setAnnotations(annotations);
        });
    }
}

Template.adminTickerStatistics.rendered = function () {
    showChart("chart", this.data.ticker, this.data.presences);
};

var redrawGraphOnEvent = function (event) {
    event.preventDefault();
    graph = undefined;
    showChart("chart", this.ticker, this.presences);
    return false;
}

Template.adminTickerStatistics.events({
    "click button.refresh": function (event) {
        event.preventDefault();
        showChart("chart", this.ticker, this.presences);
        return false;
    },
    "change #statisticsDaysLimit": redrawGraphOnEvent,
    "change #statisticsInterval": redrawGraphOnEvent,
    'change #statisticsAutoRefresh': function(event) {
        event.preventDefault();
        Session.set(SESSION_STATISTICS_AUTO_REFRESH, !!event.target.checked);
        return false;
    }
});

Template.adminTickerStatistics.helpers({
    'sessionStatisticsAutoRefresh': function () {
        return Session.get(SESSION_STATISTICS_AUTO_REFRESH);
    }
});


var refreshTimer;
var presencesTracker;
var hasChanged = false;

Tracker.autorun(function (c) {
    if (!Session.equals(SESSION_STATISTICS_AUTO_REFRESH, true)) {
        if (refreshTimer) {
            Meteor.clearInterval(refreshTimer);
            refreshTimer = false;
        }
        if (presencesTracker) {
            presencesTracker.stop();
            presencesTracker = false;
        }
    } else if (!refreshTimer) {
        Tracker.autorun(function (c) {
            Presences.find().fetch();

            if (presencesTracker) {
                hasChanged = true;
            } else {
                presencesTracker = c;
            }
        });

        refreshTimer = Meteor.setInterval(function () {
            if (hasChanged) {
                hasChanged = false;
                $('button.refresh').click();
            }
        }, 5000);
    }
});