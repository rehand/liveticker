/**
 * Created by reini on 18.03.15.
 */
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

Template.removeLastTickerEntry.events({
    "submit .remove-last-ticker-entry": function (event) {
        event.preventDefault();

        var tickerId = Router.current().params._id;

        Meteor.call("removeLastTickerEntry", tickerId, function(error) {
            if (error) {
                console.error('error ' + error.reason);
                //throwError(error.reason);
            }
        });

        // Prevent default form submit
        return false;
    }
});