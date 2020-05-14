/**
 * Created by reini on 28.03.15.
 */
Template.registerHelper("kickoffDate", function(timestamp) {
    var date = new Date(timestamp);
    return moment(date).format('DD.MM.YYYY HH:mm');
});

Template.registerHelper("chatDate", function(timestamp) {
    var date = new Date(timestamp);
    return moment(date).format('DD.MM.YYYY HH:mm');
});

Template.registerHelper("commentDate", function(timestamp) {
    var date = new Date(timestamp);
    return moment(date).format('DD.MM.YYYY HH:mm');
});

onDragStart = function (event) {
    event.dataTransfer.setData("entryId", event.target.getAttribute('data-entry-id'));
    event.dataTransfer.effectAllowed = "move";
}

onDragOver = function (event) {
    if (!!$(event.target).attr("draggable") && (!!$(event.target).hasClass("tickerEntry") || !!$(event.target).hasClass("chatEntry"))) {
        event.preventDefault();
        event.dataTransfer.effectAllowed = "move";
    }
    return false;
}

onDragEnter = function (event) {
    var parent = $(event.target).closest("div.tickerEntry,div.chatEntry");
    if (parent.length > 0) {
        event.preventDefault();
        $(parent[0]).addClass("drop-target");
    }
}

onDragLeave = function (event) {
    var parent = $(event.target).closest("div.tickerEntry,div.chatEntry");
    if (parent.length > 0) {
        event.preventDefault();
        $(parent[0]).removeClass("drop-target");
    }
}

onDrop = function (event) {
    var sourceEntryId = event.dataTransfer.getData("entryId");
    if (!sourceEntryId) {
        return;
    }

    var parent = $(event.target).closest("div.tickerEntry,div.chatEntry");
    if (parent.length > 0) {
        event.preventDefault();
        var parentElement = $(parent[0]);
        parentElement.removeClass("drop-target");
        var targetEntryId = parentElement.attr("data-entry-id");
        if (targetEntryId && sourceEntryId !== targetEntryId) {
            var method = undefined;
            if (parentElement.hasClass("tickerEntry")) {
                method = "moveTickerEntry";
            } else if (parentElement.hasClass("chatEntry")) {
                method = "moveChatEntry";
            }

            if (!!method) {
                Meteor.call(method, Router.current().params._id, sourceEntryId, targetEntryId, function (error) {
                    if (error) {
                        console.error('error ' + error.reason);
                    }
                });
            }
        }
    }
}

getChartData = function(presences, startDate, additionalDates, maxDateLimit) {
    var maxDate = Math.max(...ensureArray(presences).filter(presence => !!presence.session_created && (!maxDateLimit || presence.session_created < maxDateLimit)).map(presence => presence.session_created), 
        ...ensureArray(presences).filter(presence => !!presence.session_expired && (!maxDateLimit || presence.session_expired < maxDateLimit)).map(presence => presence.session_expired));
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