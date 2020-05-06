import Dygraph from 'dygraphs';

var showChart = function(targetId, chat, presences) {
    var data = getChartData(presences, chat.createdAt.getTime(), [chat.beginDate.getTime()]);

    var graph = new Dygraph(
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

Template.adminChatStatistics.rendered = function () {
    showChart("chart", this.data.chat, this.data.presences);
};

function getChartData(presences, startDate, additionalDates, maxDateLimit) {
    var maxDate = Math.max(...ensureArray(presences).filter(presence => !!presence.session_created).map(presence => presence.session_created), ...ensureArray(presences).filter(presence => !!presence.session_expired).map(presence => presence.session_expired));
    if (maxDateLimit) {
        maxDate = Math.min(maxDate, maxDateLimit);
    }
    var interval = 1 * 60 * 1000;
    var currentDate = startDate;
    var dateValues = [currentDate];
    while (currentDate + interval < maxDate) {
        dateValues.push(currentDate + interval);
        currentDate += interval;
    }
    dateValues.push(maxDate);
    dateValues.push(...additionalDates);

    var presenceSessionTimestampFilter = function (presence, dateValue) {
        return presence.session_created <= dateValue && (!presence.session_expired || presence.session_expired >= dateValue);
    };

    var presencesFrontend = presences.filter(presence => presence.state.route.indexOf("frontend") === 0);
    var presencesBackend = presences.filter(presence => presence.state.route.indexOf("admin") === 0);
    var data = "Datum,Frontend,Backend\n" + dateValues.sort().map(dateValue => {
        return new Date(dateValue).toISOString() + "," +
            presencesFrontend.filter(presence => presenceSessionTimestampFilter(presence, dateValue)).length + "," +
            presencesBackend.filter(presence => presenceSessionTimestampFilter(presence, dateValue)).length;
    }).join("\n");

    return data;
}