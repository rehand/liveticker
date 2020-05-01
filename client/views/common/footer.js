Template.footer.created = function () {
    Tracker.autorun(function () {
            Session.set("connectionState", Meteor.status().status);
    });
};

Template.footer.helpers({
    getConnectionState: function () {
        var connectionState = Session.get("connectionState");
        var text = "Status: " + connectionState;

        if (connectionState !== "connected") {
            text += ", Wiederholungen: " + Meteor.status().retryCount;
        }

        if (connectionState === "waiting") {
            text += ", Nächster Versuch: " + (new Date(parseInt(Meteor.status().retryTime)));
        }

        return text;
    },
    getConnectionStateIcon: function () {
        var connectionState = Session.get("connectionState");
        if (connectionState === "connected") {
            return "fa-check-circle";
        } else if (connectionState === "connecting") {
            return "fa-spinner";
        } else if (connectionState === "waiting") {
            return "fa-pause-circle";
        } else if (connectionState === "failed") {
            return "fa-times-circle";
        } else if (connectionState === "offline") {
            return "fa-stop-circle";
        }
    }
});