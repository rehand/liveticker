import Dygraph from 'dygraphs';

var graph;

var showChart = function(targetId, chat, presences) {
    var limit = new Date(chat.createdAt.getTime());
    var daysLimit = parseInt($('#statisticsDaysLimit').val());
    if (!daysLimit || isNaN(daysLimit) || daysLimit <= 0) {
        daysLimit = 3;
    }
    limit.setDate(limit.getDate() + daysLimit);

    var interval = parseInt($('#statisticsInterval').val());
    if (!interval || isNaN(interval) || interval <= 0) {
        interval = 1;
    }

    var data = getChartData(presences, chat.createdAt.getTime(), [chat.beginDate.getTime()], interval, limit.getTime());

    if (graph) {
        graph.updateOptions({
            'file': data
        });
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
            graph.setAnnotations([{
            series: "Frontend",
            x: chat.createdAt.toISOString(),
            shortText: "E",
            height: 20,
            text: "Chat erstellt"
            }, {
                series: "Frontend",
                x: chat.beginDate.toISOString(),
                shortText: "B",
                text: "Chat Beginn",
                height: 20
            }]);
        });
    }
}

Template.adminChatStatistics.rendered = function () {
    graph = undefined;
    showChart("chart", this.data.chat, this.data.presences);
};

var redrawGraphOnEvent = function (event) {
    event.preventDefault();
    graph = undefined;
    showChart("chart", this.chat, this.presences);
    return false;
}

Template.adminChatStatistics.events({
    "click .refresh": function (event) {
        event.preventDefault();
        showChart("chart", this.chat, this.presences);
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

Template.adminChatStatistics.helpers({
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