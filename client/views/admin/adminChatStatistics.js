import Dygraph from 'dygraphs';

var graph;

var showChart = function(targetId, chat) {
    var presences = PresencesLocal.find().fetch();
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
    var chat = this.data.chat;
    fetchDataFromServer(chat, () => showChart("chart", chat));
};

var redrawGraphOnEvent = function (event) {
    event.preventDefault();
    graph = undefined;
    showChart("chart", this.chat);
    return false;
}

PresencesLocal = new Mongo.Collection(null);
UserPresencesLocal = new Mongo.Collection(null);
var fetchDataFromServer = function (chat, callback) {
    $('#spinnerLoadingStatistics').show();

    PresencesLocal.remove({});

    Meteor.call("getUserPresences", chat._id, function(error, data) {
        if (error) {
            console.error('error ' + error.reason);
        } else if (data) {
            data.presences.forEach(presence => {
                PresencesLocal.insert(presence);
            });

            UserPresencesLocal.remove({});
            var userPresences = data.userPresences;
            UserPresencesLocal.insert(userPresences);

            userPresencesDep.changed();

            callback();

            $('#spinnerLoadingStatistics').hide();
        }
    });
}

Template.adminChatStatistics.events({
    "click .refresh": function (event) {
        event.preventDefault();
        if ($('#spinnerLoadingStatistics').is(':hidden')) {
            var chat = this.chat;
            fetchDataFromServer(chat, () => showChart("chart", chat));
        } else {
            console.log('currently loading...');
        }
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

var userPresencesDep = new Deps.Dependency();

Template.adminChatStatistics.helpers({
    'sessionStatisticsAutoRefresh': function () {
        return Session.get(SESSION_STATISTICS_AUTO_REFRESH);
    }, 'getUserPresences': function () {
        userPresencesDep.depend();

        var userPresences = UserPresencesLocal.findOne();
        if (userPresences) {
            return userPresences;;
        }

        return {
            connections: '-',
            frontend: '-',
            backend: '-',
            visitsFrontend: '-'
        };
    }
});

var refreshTimer;

Tracker.autorun(function (c) {
    if (!Session.equals(SESSION_STATISTICS_AUTO_REFRESH, true)) {
        if (refreshTimer) {
            Meteor.clearInterval(refreshTimer);
            refreshTimer = false;
        }
    } else if (!refreshTimer) {
        refreshTimer = Meteor.setInterval(function () {
            $('button.refresh').click();
        }, 30000);
    }
});