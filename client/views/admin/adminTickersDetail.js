/**
 * Created by reini on 18.03.15.
 */
Template.addTickerEntry.events({
    "submit .add-ticker-entry": function (event) {
        event.preventDefault();

        var tickerEntryText = event.target.text.value;
        var tickerId = Session.get('activeTickerId');

        Meteor.call("addTickerEntry", {tickerId: tickerId, tickerEntryText: tickerEntryText}, function(error) {
            if (error) {
                throwError(error.reason);
            }
        });

        // Clear form
        event.target.text.value = "";

        // Prevent default form submit
        return false;
    }
});