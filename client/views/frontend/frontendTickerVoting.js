Template.votingForm.helpers({
    mapVotableKickers: mapVotableKickers,
    getVotingOptions: function () {
        return VOTING_OPTIONS;
    }
});

Template.frontendTickerVoting.events({
    "submit .votingForm": function (event) {
        event.preventDefault();

        var formValues = $('#votingForm').serializeArray();

        var inputToValue = function (input) {
            return input['value'];
        };

        var tickerId = formValues.filter(function (data) {
            return data.name == 'tickerId';
        }).map(inputToValue)[0];

        var dataComplete = formValues.filter(function (data) {
            return data.name.indexOf('[]') !== -1;
        });

        var dataKeys = dataComplete.filter(function (data) {
            return data.name.indexOf('kickerId') !== -1;
        }).map(inputToValue);

        var dataValues = dataComplete.filter(function (data) {
            return data.name.indexOf('voting') !== -1;
        }).map(inputToValue);

        var votings = {};

        for (var i=0; i < dataValues.length; i++) {
            votings[dataKeys[i]] = parseInt(dataValues[i]);
        }

        Meteor.call("tickerVoting", tickerId, votings, function(error, data) {
            if (error) {
                console.error('error ' + error.reason);
                throwError(error.reason);
            } else if (data) {
                alert('Danke für deine Bewertung!');
                Router.go('frontendTickerDetail', {
                    '_id': tickerId
                });
            }
        });

        // Prevent default form submit
        return false;
    }
});