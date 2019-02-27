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