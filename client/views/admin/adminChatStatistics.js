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

Template.adminChatStatistics.events({
    "click .refresh": function (event) {
        event.preventDefault();

        showChart("chart", this.chat, this.presences);

        return false;
    }
});